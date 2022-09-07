import * as XLSX from 'xlsx';

function load(isRandomized) {
  /////////Randomization Utilities/////////
  function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
  }

  function rand_grade() {
    const rand = randn_bm();
    var gp;
    if(rand > -0.3 && rand < 0.3) {
      gp = 3;
    } else if (rand > -1.2 && rand <= -0.3 || rand >= 0.3 && rand < 1.2){
      gp = 4;
    } else if (rand > -2 && rand <= -1.2 || rand >= 1.2 && rand < 2) {
      gp = 2; 
    } else if (rand > -2.5 && rand <= -2 || rand >= 2 && rand < 2.5) {
      gp = 1;
    } else {
      gp = 0
    }
    return gp;
  }

  function gp_to_letter(gp) {
    const MAP = {0: 'F', 1: 'D', 2: 'C', 3:'B', 4: 'A'};
    return MAP[gp];
  }
  ////////////////////////////////////////
  function toHalfSize(str){
    if (str.length !== 1) throw new Error('toHalfSize: str.length !== 1');
    return String.fromCharCode(str.charCodeAt(0) - 65248);
  }


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

  // the data structure representing a transcript(aka. grade_report)
  var GPAData = {
    tHeadNameMap: tHeadNameMapping,
    categories: [],
    course_grades: [],
  };

  var category = "",
    newswitch = true;

  console.log('Randomized: ', isRandomized);
  // fill the empty DS with grade data
  if(isRandomized) {
    for (let i = 1; i < rows.length; i++) {
      if (rows[i].className === 'column_even') {
          if (rows[i+1].className === 'column_odd') { // New category
              category = rows[i].cells[0].textContent.trim();
              GPAData.categories.push(category);    
          }
          // newswitch = rows[i+1].className === 'column_odd'
      } else if (rows[i].className === 'column_odd') {
          let courseRecord = {};
          courseRecord['category'] = category;
          [...rows[i].cells].forEach((item, index) => {
            // convert all non-empty gp string to half-size
            if (index === 3) { // GP
              let gp = item.textContent.trim();
              if (!Number.isNaN(parseFloat(gp))) { // if gp is a number
                let fake_gp = rand_grade();
                courseRecord[theadNames[index]] = fake_gp;
                courseRecord['letter_evaluation'] = gp_to_letter(fake_gp);
              } else { // if gp is empty or non-number representation
                courseRecord[theadNames[index]] = item.textContent.trim();
              }
            } else { // non GP fields
              if (index === 2 && item.textContent.trim()) { // for non empty letter evaluation, convert to half-size
                courseRecord[theadNames[index]] = toHalfSize(item.textContent.trim())
              } else {
                courseRecord[theadNames[index]] = item.textContent.trim();  
              }
            }
          })
          GPAData.course_grades.push(courseRecord);
          // let row = [...rows[i].cells].map(td => td.textContent.trim());
          // GPAData.course_grades.push(new CourseGradeEntry(category, ...row));
      } 
    }
  } else {
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
        if (!Number.isNaN(parseFloat(row[2]))) { // if GP is a numeric, parse it number
          row[2] = parseFloat(row[2])
        } 

        if (row[3]) { // if is not empty string, convert to half size
          row[3] = toHalfSize(row[3]);
        }

        GPAData.course_grades.push(new CourseGradeEntry(category, ...row));
      }
    }
  }
  

  chrome.storage.local.set({ GPADATA: GPAData }, function () {
    console.log('GPADATA is set.');
    alert("Course result is loaded. Ready for export.");
  });

  /////////////////////////////////MAIN END/////////////////////////////////
  // for (const x of GPAData.course_grades) {
  //   console.log(...Object.values(x));
  // }
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

export const loadTranscript = async (isRandomized) => {
  console.log("Loading...")
  // Get reference to current tab (page)
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // If the page is not campusmate? Give a feedback like: you have to go to the course result page to load the data!!

  // Programmatically inject a script and execute it on current tab
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: load,
    args: [isRandomized]
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

export const exportTranscriptJSON = () => {
  chrome.storage.local.get(['GPADATA'], function (result) {
    // console.log(result.GPADATA);
    const json = JSON.stringify(result.GPADATA);
    // console.log(json);
    var blob1 = new Blob([json], { type: "text/plain;charset=utf-8" });

    const link = window.URL.createObjectURL(blob1);
    console.log('Object\'s url is', link);
    const a = document.createElement('a');
    a.download = "grade_report.json";
    a.href = link;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    // XLSX.writeFile(result.GPADATA, 'grade_report.json');
  });
}