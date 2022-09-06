const loadBtn = document.getElementById("load");
loadBtn.addEventListener('click', async () => {
  console.log("Loading...")
  // Get reference to current tab (page)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // If the page is not campusmate? Give a feedback like: you have to go to the course result page to load the data!!

  // Programmatically inject a script and execute it on current tab
  chrome.scripting.executeScript({
    target: {tabId: tab.id}, 
    function: load,
  });
});

function load() {
  ////// Data Structure for holding a course's gpa and its administrative information
  class CourseGradeEntry {
    constructor (category, subject, unit, letter_evaluation, gpa, year, quarter, subject_number, course_id, prinstructor, last_updated) {
        this.category = category;
        this.subject = subject;
        this.unit = unit;
        this.letter_evaluation = letter_evaluation; // = { A, B, C, D, F, R }
        this.gpa = gpa; // This might not be a number
        this.year = year; 
        this.quarter = quarter;
        this.subject_number = subject_number;
        this.course_id = course_id;
        this.prinstructor = prinstructor;
        this.last_updated = last_updated;
    }
  }

  const table = document.querySelector('table.list'),
      tBody = table.tBodies[0],
      rows = Array.from(tBody.rows);

  console.log(rows[0].children.length === 10);

  const tHeadNameMapping = {},
        theadNames = ['subject', 'unit', 'letter_evaluation', 'gpa', 'year', 'quarter', 'subject_number', 'course_id', 'prinstructor', 'last_updated'];

  // First row is the column header
  [...rows[0].children].map(td => td.textContent).forEach((text, idx) => {tHeadNameMapping[theadNames[idx]] = text;} );

  // the data structure representing a transcript(aka. grade_report)
  var GPAData = {
    tHeadNameMap: tHeadNameMapping,
    categories: [],
    course_grades: [],
  };

  var category = "",
  newswitch = true;

  // Fill in GPAData ds
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].className === 'column_even') {
        if (rows[i+1].className === 'column_odd') { // New category
            category = rows[i].cells[0].textContent.trim();
            GPAData.categories.push(category);    
        }
        // newswitch = rows[i+1].className === 'column_odd'
    } else if (rows[i].className === 'column_odd') {
        let row = [...rows[i].cells].map(td => td.textContent.trim());
        GPAData.course_grades.push(new CourseGradeEntry(category, ...row));
    } 
  }
  
  chrome.storage.local.set({GPADATA: GPAData}, function() {
    console.log('GPADATA is set.');
    alert("Course result is loaded. Ready for export.");
  });

  /////////////////////////////////MAIN END/////////////////////////////////
  for (const x of GPAData.course_grades) {
    console.log(...Object.values(x));
  }
}
