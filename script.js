const members = [

{
name:"นาย ศักรินทร์ กลิ่นจำปา",
position:"ประธาน"
},

{
name:"นาย ยศทศักดิ์ จันทวงค์",
position:"รองประธาน"
},

{
name:"น.ส. รัญชรัตน์ สรวงวัฒนมา",
position:"รองประธาน"
},

{
name:"นาย ปุญญพัฒน์ สารมโน",
position:"เลขานุการ"
},


];

function renderMembers(){

const table =
document.getElementById("memberTable");

table.innerHTML = "";

members.forEach(member=>{

table.innerHTML += `

<tr>

<td>${member.name}</td>

<td>${member.position}</td>

<td>

<select class="status">

<option>มา</option>
<option>สาย</option>
<option>ขาด</option>
<option>ลา</option>

</select>

</td>

</tr>

`;

});

}

if(
localStorage.getItem("isLogin")
!== "true"
){

window.location.href =
"login.html";

}

document.getElementById("today").innerHTML =
"วันที่ : " + new Date().toLocaleDateString("th-TH");

function saveAttendance(){

    alert("ปุ่มทำงานแล้ว");

const selects =
document.querySelectorAll(".status");

let present = 0;
let late = 0;
let absent = 0;
let leave = 0;

let data = [];

selects.forEach((item)=>{

const row = item.closest("tr");

const record = {

name: row.cells[0].innerText,
position: row.cells[1].innerText,
status: item.value

};

data.push(record);

if(item.value === "มา") present++;
if(item.value === "สาย") late++;
if(item.value === "ขาด") absent++;
if(item.value === "ลา") leave++;

});

const today =
new Date().toISOString().split("T")[0];

localStorage.setItem(
"attendance_" + today,
JSON.stringify(data)
);

fetch(
"https://script.google.com/macros/s/AKfycbyuEb0N6bVfEfcGKX1tulN9LqKJkIzMsigLTWFiCFzNGYZl5i280AiYJvowE4QzzHYj/exec",
{
    method:"POST",
    mode:"no-cors",
    headers:{
        "Content-Type":"text/plain"
    },
    body:JSON.stringify(data)
})
.then(()=>{
    alert("ส่งข้อมูลแล้ว");
})
.catch(err=>{
    console.log(err);
});

loadDateList();

updateLists(data);

document.getElementById("presentCount").innerText = present;
document.getElementById("lateCount").innerText = late;
document.getElementById("absentCount").innerText = absent;
document.getElementById("leaveCount").innerText = leave;

document.getElementById("result").innerHTML =

`<div style="
padding:15px;
background:#d1e7dd;
color:#0f5132;
border-radius:10px;
margin-top:15px;">
✅ บันทึกข้อมูลสำเร็จ เวลา ${new Date().toLocaleTimeString("th-TH")}
</div>`;

}

window.onload = function () {

    // แสดงรายชื่อสมาชิก
    renderMembers();

    // แสดงวันที่ปัจจุบัน
    document.getElementById("today").innerHTML =
        "วันที่ : " + new Date().toLocaleDateString("th-TH");

    // โหลดรายการวันที่จาก Google Sheets
    loadDateList();

    // รอให้โหลดวันที่เสร็จ แล้วโหลดข้อมูลของวันที่ล่าสุด
    setTimeout(() => {

        const historySelect = document.getElementById("historySelect");

        if (historySelect.options.length > 0) {

            historySelect.selectedIndex = 0;

            loadHistoryFromList();

        }

    }, 1000);

};

function updateLists(data){

let presentHTML = "";
let lateHTML = "";
let absentHTML = "";
let leaveHTML = "";

data.forEach(person=>{

if(person.status==="มา"){
presentHTML += `<li>${person.name}</li>`;
}

if(person.status==="สาย"){
lateHTML += `<li>${person.name}</li>`;
}

if(person.status==="ขาด"){
absentHTML += `<li>${person.name}</li>`;
}

if(person.status==="ลา"){
leaveHTML += `<li>${person.name}</li>`;
}

});

document.getElementById("presentList").innerHTML = presentHTML;
document.getElementById("lateList").innerHTML = lateHTML;
document.getElementById("absentList").innerHTML = absentHTML;
document.getElementById("leaveList").innerHTML = leaveHTML;

}

function loadHistory(){

const date =
document.getElementById("historyDate").value;


const savedData =
localStorage.getItem(
"attendance_" + date
);

console.log("วันที่ที่เลือก =", date);
console.log("ข้อมูล =", savedData);

if(!savedData){

alert("ไม่มีข้อมูลวันที่นี้");
return;

}

const data =
JSON.parse(savedData);

const selects =
document.querySelectorAll(".status");

data.forEach((item,index)=>{

    if(selects[index]){
        selects[index].value = item.status;
    }

});

updateLists(data);

let present = 0;
let late = 0;
let absent = 0;
let leave = 0;

data.forEach(item=>{

if(item.status==="มา") present++;
if(item.status==="สาย") late++;
if(item.status==="ขาด") absent++;
if(item.status==="ลา") leave++;

});

document.getElementById("presentCount").innerText = present;
document.getElementById("lateCount").innerText = late;
document.getElementById("absentCount").innerText = absent;
document.getElementById("leaveCount").innerText = leave;

}

async function exportPDF(){

    const element =
    document.getElementById("reportArea");

    const canvas =
    await html2canvas(element,{
        scale:2
    });

    const imgData =
    canvas.toDataURL("image/png");

    const { jsPDF } = window.jspdf;

    const pdf =
    new jsPDF("p","mm","a4");

    const pdfWidth =
    pdf.internal.pageSize.getWidth();

    const imgWidth =
    pdfWidth;

    const imgHeight =
    (canvas.height * imgWidth)
    / canvas.width;

    pdf.addImage(
        imgData,
        "PNG",
        0,
        0,
        imgWidth,
        imgHeight
    );

    pdf.save(
        "รายงานเช็คชื่อ.pdf"
    );

}

function logout(){

    localStorage.removeItem("isLogin");
    localStorage.removeItem("username");

    window.location.href =
    "login.html";

}

function loadDateList(){

const select =
document.getElementById("historySelect");

select.innerHTML = "";

Object.keys(localStorage)

.filter(key => key.startsWith("attendance_"))

.sort()

.reverse()

.forEach(key=>{

const date =
key.replace("attendance_","");

select.innerHTML +=
`<option value="${date}">
${date}
</option>`;

});

}

async function loadHistoryFromList() {

    const date = document.getElementById("historySelect").value;

    console.log("วันที่ที่เลือก =", date);

    const res = await fetch(API_URL + "?action=history&date=" + encodeURIComponent(date));

    const data = await res.json();

    console.log("ข้อมูลที่ได้รับ =", data);

    if (data.length === 0) {
        alert("ไม่มีข้อมูล");
        return;
    }

    updateLists(data);

    const selects = document.querySelectorAll(".status");

    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    data.forEach((item, index) => {

        if (selects[index]) {
            selects[index].value = item.status;
        }

        if (item.status === "มา") present++;
        if (item.status === "สาย") late++;
        if (item.status === "ขาด") absent++;
        if (item.status === "ลา") leave++;

    });

    document.getElementById("presentCount").innerText = present;
    document.getElementById("lateCount").innerText = late;
    document.getElementById("absentCount").innerText = absent;
    document.getElementById("leaveCount").innerText = leave;
}

async function loadHistoryFromSheet() {

    const date = document.getElementById("historyDate").value;

    if (!date) {
        alert("กรุณาเลือกวันที่");
        return;
    }

    const response = await fetch("https://script.google.com/macros/s/AKfycbyuEb0N6bVfEfcGKX1tulN9LqKJkIzMsigLTWFiCFzNGYZl5i280AiYJvowE4QzzHYj/exec");

    const rows = await response.json();

    const data = [];

    rows.slice(1).forEach(row => {

        const sheetDate = new Date(row[0]).toISOString().split("T")[0];

        if (sheetDate === date) {

            data.push({
                name: row[1],
                position: row[2],
                status: row[3]
            });

        }

    });

    if (data.length === 0) {
        alert("ไม่มีข้อมูลวันที่นี้");
        return;
    }

    updateLists(data);

    const selects = document.querySelectorAll(".status");

    let present = 0;
    let late = 0;
    let absent = 0;
    let leave = 0;

    data.forEach((item, index) => {

        if (selects[index]) {
            selects[index].value = item.status;
        }

        if (item.status === "มา") present++;
        if (item.status === "สาย") late++;
        if (item.status === "ขาด") absent++;
        if (item.status === "ลา") leave++;

    });

    document.getElementById("presentCount").innerText = present;
    document.getElementById("lateCount").innerText = late;
    document.getElementById("absentCount").innerText = absent;
    document.getElementById("leaveCount").innerText = leave;

}

const API_URL = "https://script.google.com/macros/s/AKfycbyuEb0N6bVfEfcGKX1tulN9LqKJkIzMsigLTWFiCFzNGYZl5i280AiYJvowE4QzzHYj/exec";

async function loadDateList() {

    console.log("กำลังโหลดวันที่...");

    const select = document.getElementById("historySelect");

    select.innerHTML = "";

    const res = await fetch(API_URL + "?action=dates");

    const dates = await res.json();

    console.log("วันที่ที่ได้รับ =", dates);

    dates.reverse().forEach(date => {

        select.innerHTML += `
        <option value="${date}">
            ${date}
        </option>`;

    });

}