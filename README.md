# QCampusmate Mate for Class
## Usage
1. Run `npm run build` to build extension package in `./dist`.
2. Go to Chrome.
3. Click on the extension icon on top right, then click on **manage extension**
4. Click **Load unpacked** on top left, then select and open the `./dist`


## About
This extension aims to enhance UX around `Course Results/成績照会` page on Kyushu University Campusmate site:  
- Mouse click on Campusmate is very delayed, because Campusmate in general loads slow and for some reasons it frowns upon frequent clicks, which causes long waits, sometimes necessites a reload, and, in the worst case, a complete re-login. This extention has none of these problems. 
- It includes all information available on `Course Results/成績照会` page, and, additionally, enables the users to sort/filter based on grade, year and course category etc.
- It shows units remaining to graduate by calculating the currently earned units againt degree requirements.

## Implemented Features
- When the active tab is on `Course Results/成績照会` page, click `load` will extract the transcript data from the document in question and cache the processed object to `chrome.local`
- `export` allows user to download the cached transcript in `.xlsx` format.


p.s.
*The developer is currently considering adding an academic plan interface that  enables freshman/sophomore students to conveniently formulate plans on taking courses throughout their undergraduate career.*



