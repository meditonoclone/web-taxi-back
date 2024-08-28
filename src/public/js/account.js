const historyTripSwitch = document.querySelector('.trip_history>h4');
const historyTable = document.querySelector('.trip_history>table');
const chevronUp = document.querySelector('.trip_history i.fa-chevron-up');
const chevronDown = document.querySelector('.trip_history i.fa-chevron-down');
function toggleHistoryTable() {
  historyTable.classList.toggle('hide');
  chevronUp.classList.toggle('hide');
  chevronDown.classList.toggle('hide');
}
historyTripSwitch.addEventListener('click', toggleHistoryTable);