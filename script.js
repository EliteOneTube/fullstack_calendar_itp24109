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

let events = [];
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
        const eventsOnThisDay = events.filter(event => event.date === selectedDate);
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

function openEventModal(day, eventsOnThisDay, selectedDate) {
    eventModal.classList.remove('hidden');
    modalTitle.textContent = `Συμβάντα για ${day}/${activeDate.getMonth() + 1}/${activeDate.getFullYear()}`;
    document.getElementById('event-date').value = selectedDate;

    const eventList = document.getElementById('event-list');
    eventList.innerHTML = ''; // Clear previous list

    if (eventsOnThisDay.length > 0) {
        eventsOnThisDay.forEach((event, index) => {
            const listItem = document.createElement('div');
            listItem.className = 'event-item';
            listItem.innerHTML = `
                <h4>${event.title} (${event.time})</h4>
                <p>${event.description}</p>
                <button data-index="${index}" class="edit-event">Επεξεργασία</button>
                <button data-index="${index}" class="delete-event">Διαγραφή</button>
            `;
            eventList.appendChild(listItem);

            // Edit Event
            listItem.querySelector('.edit-event').addEventListener('click', () => {
                populateFormForEdit(event, index);
            });

            // Delete Event
            listItem.querySelector('.delete-event').addEventListener('click', () => {
                deleteEvent(index);
                createCalendar(); // Refresh calendar
                openEventModal(day, events.filter(e => e.date === selectedDate), selectedDate);
            });
        });
    } else {
        eventList.innerHTML = '<p>Δεν υπάρχουν συμβάντα για αυτή την ημέρα.</p>';
    }
}

function populateFormForEdit(event, index) {
    document.getElementById('event-title').value = event.title;
    document.getElementById('event-description').value = event.description;
    document.getElementById('event-date').value = event.date;
    document.getElementById('event-time').value = event.time;
    eventModal.dataset.editIndex = index; // Store index for saving
}

closeModalButton.addEventListener('click', () => {
    eventModal.classList.add('hidden');
    eventModal.dataset.editIndex = undefined; // Clear edit mode
    eventForm.reset();
});

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;

    const editIndex = eventModal.dataset.editIndex;
    if (editIndex !== undefined) {
        // Update existing event
        events[editIndex] = { title, description, date, time };
        eventModal.dataset.editIndex = undefined; // Clear edit mode
    } else {
        // Add new event
        events.push({ title, description, date, time });
    }

    showNotification('Το συμβάν αποθηκεύτηκε επιτυχώς!');
    eventModal.classList.add('hidden');
    eventForm.reset();
    createCalendar(); // Refresh calendar
});

function deleteEvent(index) {
    events.splice(index, 1); // Remove event from array
    showNotification('Το συμβάν διαγράφηκε.');
}

searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredEvents = events.filter(event =>
        event.title.toLowerCase().includes(query) ||
        event.date.includes(query)
    );
    console.log('Αποτελέσματα Αναζήτησης:', filteredEvents);
});

exportButton.addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8,"
        + events.map(e => `${e.title},${e.description},${e.date},${e.time}`).join("\n");
    const encodedUri = encodeURI(csvContent);
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

    // Automatically remove the notification after 4 seconds
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// Initialize the calendar
createCalendar();
