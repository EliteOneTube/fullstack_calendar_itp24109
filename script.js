const calendar = document.getElementById('calendar').querySelector('tbody');
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const modalTitle = document.getElementById('modal-title');
const closeModalButton = document.getElementById('close-modal');
const searchInput = document.getElementById('search-bar');
const exportButton = document.getElementById('export-events');
const currentMonthDisplay = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');
const modalOverlay = document.getElementById('modal-overlay');
const allDayEventCheckbox = document.getElementById('all-day-event');
const eventTimeInput = document.getElementById('event-time');
const dropdown = document.getElementById('search-results');

let events = {}; // Change from array to object
let activeDate = new Date();

const months = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
    'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
    'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
];

function createCalendar() {
    calendar.innerHTML = ''; // Clear the calendar

    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    currentMonthDisplay.textContent = `${months[month]} ${year}`;

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Adjust for Monday as the first day of the week
    const offset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    let row = document.createElement('tr');
    for (let i = 0; i < offset; i++) {
        const blankCell = document.createElement('td');
        blankCell.className = 'blank';
        row.appendChild(blankCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('td');
        cell.className = 'day';
        cell.textContent = day;

        const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Check if there are events on this date
        const eventsOnThisDay = events[selectedDate] || [];
        if (eventsOnThisDay.length > 0) {
            const eventIndicator = document.createElement('span');
            eventIndicator.className = 'event-indicator';
            cell.appendChild(eventIndicator);
        }

        cell.addEventListener('click', () => {
            openEventModal(day, eventsOnThisDay, selectedDate);
        });

        row.appendChild(cell);

        // If the row is complete, append it to the calendar and start a new row
        if ((offset + day) % 7 === 0) {
            calendar.appendChild(row);
            row = document.createElement('tr');
        }
    }

    // Append the remaining row if it contains any cells
    if (row.children.length > 0) {
        calendar.appendChild(row);
    }
}

prevMonthButton.addEventListener('click', () => {
    activeDate.setMonth(activeDate.getMonth() - 1);
    createCalendar();
});

nextMonthButton.addEventListener('click', () => {
    activeDate.setMonth(activeDate.getMonth() + 1);
    createCalendar();
});

allDayEventCheckbox.addEventListener('change', () => {
    if (allDayEventCheckbox.checked) {
        eventTimeInput.disabled = true; // Disable time input
        eventTimeInput.value = ''; // Clear time input
    } else {
        eventTimeInput.disabled = false; // Enable time input
        const now = new Date(); // Set default time again
        const currentHour = String(now.getHours()).padStart(2, '0');
        const currentMinute = String(now.getMinutes()).padStart(2, '0');
        eventTimeInput.value = `${currentHour}:${currentMinute}`;
    }
});

function openEventModal(day, eventsOnThisDay, selectedDate) {
    modalOverlay.classList.remove('hidden');
    modalTitle.textContent = `Συμβάντα για ${day}/${activeDate.getMonth() + 1}/${activeDate.getFullYear()}`;
    document.getElementById('event-date').value = selectedDate;

    const eventList = document.getElementById('event-list');
    eventList.innerHTML = '';

    // Preselect current time
    const now = new Date();
    const currentHour = String(now.getHours()).padStart(2, '0');
    const currentMinute = String(now.getMinutes()).padStart(2, '0');
    eventTimeInput.value = `${currentHour}:${currentMinute}`;
    if (eventsOnThisDay.length > 0) {
        eventsOnThisDay.forEach((event, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'event-item';
            listItem.innerHTML = `
                <h4>${event.title} (${event.isAllDay ? 'Όλη την ημέρα' : event.time})</h4>
                <p>${event.description}</p>
                <button data-index="${index}" class="edit-event">Επεξεργασία</button>
                <button data-index="${index}" class="delete-event">Διαγραφή</button>
            `;
            eventList.appendChild(listItem);

            // Edit Event
            listItem.querySelector('.edit-event').addEventListener('click', () => {
                populateFormForEdit(event, selectedDate, index);
            });

            // Delete Event
            listItem.querySelector('.delete-event').addEventListener('click', () => {
                deleteEvent(selectedDate, index);
                createCalendar(); // Refresh calendar
                openEventModal(day, events[selectedDate] || [], selectedDate);
            });
        });
    } else {
        eventList.innerHTML = '<p>Δεν υπάρχουν συμβάντα για αυτή την ημέρα.</p>';
    }
}

function populateFormForEdit(event, date, index) {
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-date').value = date;
    if (event.isAllDay) {
        allDayEventCheckbox.checked = true;
        eventTimeInput.disabled = true;
        eventTimeInput.value = '';
    } else {
        allDayEventCheckbox.checked = false;
        eventTimeInput.disabled = false;
        eventTimeInput.value = event.time;
    }
    eventModal.dataset.editIndex = index;
    eventModal.dataset.editDate = date;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !eventModal.classList.contains('hidden')) {
        closeModal();
    }
});

function closeModal() {
    modalOverlay.classList.add('hidden');
    eventModal.dataset.editIndex = null;
    eventModal.dataset.editDate = null;
    allDayEventCheckbox.checked = false;
    eventForm.reset();
}

// Close modal on overlay click
modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
        closeModal();
    }
});

// Update the close button event listener to use the closeModal function
closeModalButton.addEventListener('click', closeModal);

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const isAllDay = allDayEventCheckbox.checked;
    const time = isAllDay ? 'Όλη την ημέρα' : document.getElementById('event-time').value;

    const editIndex = eventModal.dataset.editIndex;
    const editDate = eventModal.dataset.editDate;

    if (editIndex !== null && editDate === date) {
        // Update existing event
        events[date][editIndex] = { title, description, date, time, isAllDay };
    } else {
        // Add new event
        if (!events[date]) {
            events[date] = [];
        }
        events[date].push({ title, description, date, time, isAllDay });
    }

    saveEventsToLocalStorage(); // Save to localStorage
    showNotification('Το συμβάν αποθηκεύτηκε επιτυχώς!');
    closeModal();
    createCalendar(); // Refresh calendar
});

function deleteEvent(date, index) {
    if (events[date]) {
        events[date].splice(index, 1);
        if (events[date].length === 0) {
            delete events[date];
        }
        saveEventsToLocalStorage(); // Save to localStorage
        showNotification('Το συμβάν διαγράφηκε.');
    }
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    dropdown.innerHTML = '';

    if (!query) {
        dropdown.classList.add('hidden');
        createCalendar(); // Show full calendar when search is cleared
        return;
    }

    const filteredEvents = Object.entries(events).flatMap(([date, eventList]) =>
        eventList.map(event => ({
            ...event,
            date
        })).filter(event =>
            event.title.toLowerCase().includes(query) ||
            date.includes(query)
        )
    );

    if (filteredEvents.length > 0) {
        dropdown.classList.remove('hidden');
        filteredEvents.forEach(event => {
            const item = document.createElement('div');
            item.className = 'dropdown-item';
            item.textContent = `${event.title} (${event.date})`;
            item.addEventListener('click', () => {
                searchInput.value = event.title;
                dropdown.classList.add('hidden');
                const [year, month, day] = event.date.split('-').map(Number);
                populateFormForEdit(event, event.date, events[event.date].indexOf(event));
                openEventModal(day, events[event.date], event.date);
                searchInput.value = '';
            });
            dropdown.appendChild(item);
        });
    } else {
        dropdown.classList.add('hidden');
    }
});

//Listen for export button click
exportButton.addEventListener('click', () => {
    if(Object.keys(events).length === 0) {
        showNotification('Δεν υπάρχουν συμβάντα για εξαγωγή.', 'error');
        return;
    }

    const header = "Τίτλος;Περιγραφή;Ημερομηνία;Ώρα\n"; 

    const rows = Object.entries(events).flatMap(([date, eventList]) =>
        eventList.map(e =>
            [
                `"${e.title}"`,        // Enclose in quotes to handle special characters
                `"${e.description}"`,
                `"${date}"`,
                `"${e.time}"`
            ].join(';')              // Use semicolon as the delimiter
        )
    );

    // Combine header and rows
    const csvContent = header + rows.join("\n");

    // Add UTF-8 BOM for compatibility
    const bom = '\uFEFF';

    // Encode the CSV content
    const encodedUri = encodeURI("data:text/csv;charset=utf-8," + bom + csvContent);

    // Create and trigger the download link
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "events.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
});

function showNotification(message, type = 'success') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">✖</button>
    `;

    container.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 4000);
}

document.getElementById('close-modal-button').addEventListener('click', function () {
    closeModal();
});

function saveEventsToLocalStorage() {
    localStorage.setItem('events', JSON.stringify(events));
}

function loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem('events');
    if (storedEvents) {
        events = JSON.parse(storedEvents);
    }
}

loadEventsFromLocalStorage();

// Initialize the calendar
createCalendar();
