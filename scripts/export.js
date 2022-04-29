//////////////////////////////////////////////////////////////////////
const exportBtn = document.getElementById("export");
exportBtn.addEventListener('click', async () => {
    console.log("Exporting...")
    // Get reference to current tab (page)
    chrome.storage.local.get(['GPADATA'], function(result) {
        console.log(result.GPADATA);
        exportData(result.GPADATA);
    });
});

function exportData(gpaData){
  const nameMap = gpaData.tHeadNameMap,
  categories = gpaData.categories,
  course_grades = gpaData.course_grades,
  first = nameMap['subject'];

  nameMap['category'] = '分野系列名／科目名';
  var filename = 'grade_report.xlsx',
          data = [{[first]: course_grades[0]['category']}],
        reKeys = obj => { const keyValues = Object.keys(obj)
                          .map(k => {const newKey = nameMap[k] || k;
                                return { [newKey]: obj[k] }
                              });
                          console.log(Object.assign({}, ...keyValues));
                          return Object.assign({}, ...keyValues);
                          }

  course_grades.forEach((e, i, arr) => {
    data.push(reKeys(e));
    if(arr[i+1] && arr[i]['category'] != arr[i+1]['category']){
      data.push({[first]: arr[i+1]['category']});
    }
  })

  var ws = XLSX.utils.json_to_sheet(data);
  var wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "成績表");
  XLSX.writeFile(wb,filename);
}









