
// --- הגדרות SCORM ---
var scorm = pipwerks.SCORM;
var isConnected = false;

// 1. חיבור למערכת (Init) בעת טעינת הדף
window.addEventListener("load", function() {
    isConnected = scorm.init();
    if (isConnected) {
        console.log("SCORM: Connected successfully!");
        // אופציונלי: קבלת שם הסטודנט
        var studentName = scorm.get("cmi.core.student_name");
        if(studentName) console.log("Hello " + studentName);
    } else {
        console.log("SCORM: Not connected (Local mode)");
    }
});

// 2. ניתוק מהמערכת (Quit) בעת סגירת הדף
window.addEventListener("beforeunload", function() {
    if (isConnected) {
        scorm.save();
        scorm.quit();
    }
});

// --- פונקציה 1: מנגנון חיפוש ---
function filterContent() {
    const input = document.getElementById("searchInput");
    const filterText = input.value.toLowerCase();
    const cards = document.getElementsByClassName("content-card");

    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        let textContent = card.innerText.toLowerCase();
        if (textContent.includes(filterText)) {
            card.style.display = "";
        } else {
            card.style.display = "none";
        }
    }
}

// --- פונקציה 2: דיווח ל-LMS (לחיצה על הכפתור הירוק) ---
function reportToLMS() {
    // א. איסוף המידע מהטופס
    const projectName = document.getElementById("projectName").value;
    const audience = document.getElementById("targetAudience").value;
    const outputType = document.getElementById("outputType").value;

    // ב. בדיקת תקינות
    if (projectName === "" || audience === "") {
        alert("נא למלא את כל השדות!");
        return;
    }

    // ג. הכנת המחרוזת לשליחה
    const dataToSave = "Project: " + projectName + " | Audience: " + audience + " | Type: " + outputType;

    // ד. שליחה למודל (אם מחוברים)
    if (isConnected) {
        // שמירת הנתונים בשדה כללי
        scorm.set("cmi.suspend_data", dataToSave);

        // סימון שהלומדה הושלמה
        scorm.set("cmi.core.lesson_status", "completed");

        // מתן ציון 100
        scorm.set("cmi.core.score.raw", "100");
        scorm.set("cmi.core.score.max", "100");
        scorm.set("cmi.core.score.min", "0");

        // שמירה לשרת
        var success = scorm.save();

        if (success) {
            alert("הנתונים נשמרו במערכת הלמידה בהצלחה!");
        } else {
            alert("היתה בעיה בשמירה ל-LMS.");
        }
    } else {
        // מצב מקומי (בבית)
        console.log("Local Simulation: " + dataToSave);
        alert("הפרויקט נוצר (סימולציה מקומית - לא מחובר למודל).\n" + dataToSave);
    }

    // איפוס הטופס בסוף
    document.getElementById("lmsForm").reset();
}