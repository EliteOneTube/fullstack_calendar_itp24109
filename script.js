const calendar = document.getElementById('calendar');
const eventModal = document.getElementById('event-modal');
const eventForm = document.getElementById('event-form');
const modalTitle = document.getElementById('modal-title');
const closeModalButton = document.getElementById('close-modal');
const searchInput = document.getElementById('search-bar');
const exportButton = document.getElementById('export-events');
const currentMonthDisplay = document.getElementById('current-month');
const prevMonthButton = document.getElementById('prev-month');
const nextMonthButton = document.getElementById('next-month');

// Αποθήκευση Συμβάντων
let events = [];

// Ενεργή Ημερομηνία
let activeDate = new Date(); // Default to today

// Λίστα Μηνών
const months = [
    'Ιανουάριος', 'Φεβρουάριος', 'Μάρτιος', 'Απρίλιος',
    'Μάιος', 'Ιούνιος', 'Ιούλιος', 'Αύγουστος',
    'Σεπτέμβριος', 'Οκτώβριος', 'Νοέμβριος', 'Δεκέμβριος'
];

// Λίστα Ημερών Εβδομάδας
const daysOfWeek = ['Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο', 'Κυριακή'];

// Δημιουργία Ημερολογίου
function createCalendar() {
    calendar.innerHTML = ''; // Καθαρισμός παλιού ημερολογίου

    const year = activeDate.getFullYear();
    const month = activeDate.getMonth();

    currentMonthDisplay.textContent = `${months[month]} ${year}`;

    // // Προσθήκη ημερών εβδομάδας
    // const daysOfWeekRow = document.createElement('div');
    // daysOfWeekRow.id = 'days-of-week';
    // daysOfWeek.forEach(day => {
    //     const dayElement = document.createElement('div');
    //     dayElement.className = 'day-of-week';
    //     dayElement.textContent = day;
    //     daysOfWeekRow.appendChild(dayElement);
    // });
    // calendar.appendChild(daysOfWeekRow);

    // Πρώτη ημέρα του μήνα
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Προσθήκη κενών για την πρώτη εβδομάδα
    for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
        const blankDay = document.createElement('div');
        blankDay.className = 'day blank';
        calendar.appendChild(blankDay);
    }

    // Δημιουργία ημερών
    for (let i = 1; i <= daysInMonth; i++) {
        const day = document.createElement('div');
        day.className = 'day';
        day.textContent = i;

        day.addEventListener('click', () => {
            openEventModal(i);
            const selectedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            document.getElementById('event-date').value = selectedDate; // Αυτόματη συμπλήρωση
        });

        calendar.appendChild(day);
    }
}

// Αλλαγή Μήνα
prevMonthButton.addEventListener('click', () => {
    activeDate.setMonth(activeDate.getMonth() - 1);
    createCalendar();
});

nextMonthButton.addEventListener('click', () => {
    activeDate.setMonth(activeDate.getMonth() + 1);
    createCalendar();
});

// Άνοιγμα Αναδυόμενου Παράθυρου
function openEventModal(day) {
    eventModal.classList.remove('hidden');
    modalTitle.textContent = `Νέο Συμβάν για ${day}`;
}

// Κλείσιμο Αναδυόμενου Παράθυρου
closeModalButton.addEventListener('click', () => {
    eventModal.classList.add('hidden');
    eventForm.reset();
});

// Υποβολή Φόρμας
eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const time = document.getElementById('event-time').value;

    // Αποθήκευση Συμβάντος
    events.push({ title, description, date, time });
    alert('Το συμβάν αποθηκεύτηκε επιτυχώς!');
    eventModal.classList.add('hidden');
    eventForm.reset();
});

// Αναζήτηση Συμβάντων
searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    const filteredEvents = events.filter(event => 
        event.title.toLowerCase().includes(query) || 
        event.date.includes(query)
    );
    console.log('Αποτελέσματα Αναζήτησης:', filteredEvents);
});

// Εξαγωγή Συμβάντων
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

// Δημιουργία Ημερολογίου Κατά την Εκκίνηση
createCalendar();
