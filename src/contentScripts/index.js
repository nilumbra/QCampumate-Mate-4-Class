import * as XLSX from 'xlsx';

function load() {
  ////// Data Structure for holding a course's gpa and its administrative information
  class CourseGradeEntry {
    constructor(category, subject, unit, letter_evaluation, gpa, year, quarter, subject_number, course_id, prinstructor, last_updated) {
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
  [...rows[0].children].map(td => td.textContent).forEach((text, idx) => { tHeadNameMapping[theadNames[idx]] = text; });

  // Data Structure for final output
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
      if (rows[i + 1].className === 'column_odd') { // New category
        category = rows[i].cells[0].textContent.trim();
        GPAData.categories.push(category);
      }
      // newswitch = rows[i+1].className === 'column_odd'
    } else if (rows[i].className === 'column_odd') {
      let row = [...rows[i].cells].map(td => td.textContent.trim());
      GPAData.course_grades.push(new CourseGradeEntry(category, ...row));
    }
  }

  chrome.storage.local.set({ GPADATA: GPAData }, function () {
    console.log('GPADATA is set.');
    alert("Course result is loaded. Ready for export.");
  });

  /////////////////////////////////MAIN END/////////////////////////////////
  for (const x of GPAData.course_grades) {
    console.log(...Object.values(x));
  }
}

function exportData(gpaData) {
  const nameMap = gpaData.tHeadNameMap,
    categories = gpaData.categories,
    course_grades = gpaData.course_grades,
    first = nameMap['subject'];

  nameMap['category'] = '分野系列名／科目名';
  var filename = 'grade_report.xlsx',
    data = [{ [first]: course_grades[0]['category'] }],
    reKeys = obj => {
      const keyValues = Object.keys(obj)
        .map(k => {
          const newKey = nameMap[k] || k;
          return { [newKey]: obj[k] }
        });
      console.log(Object.assign({}, ...keyValues));
      return Object.assign({}, ...keyValues);
    }

  course_grades.forEach((e, i, arr) => {
    data.push(reKeys(e));
    if (arr[i + 1] && arr[i]['category'] != arr[i + 1]['category']) {
      data.push({ [first]: arr[i + 1]['category'] });
    }
  })

  var ws = XLSX.utils.json_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "成績表");
  XLSX.writeFile(wb, filename);
}
export const loadTranscript = async () => {
  console.log("Loading...")
  // Get reference to current tab (page)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // If the page is not campusmate? Give a feedback like: you have to go to the course result page to load the data!!

  // Programmatically inject a script and execute it on current tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: load,
  });
}

export const exportTranscript = () => {
  console.log("Exporting...")
  // Get reference to current tab (page)
  chrome.storage.local.get(['GPADATA'], function (result) {
    console.log(result.GPADATA);
    exportData(result.GPADATA);
  });
}