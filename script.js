var GradeElement = "gradeElement"
var CustomElement = "customElement"

var field = document.querySelector('.gradeSelectorBox');
var range = document.querySelector('.gradeSelectorSlider');
field.addEventListener('input', function (e) { range.value = e.target.value; });
range.addEventListener('input', function (e) { field.value = e.target.value; });
// Init
loadConfig()

// Save everytime @InjectScript() is called
function saveConfig(){
    var vGrade = document.getElementById(GradeElement).value;
    var vCustomElementStr = document.getElementById(CustomElement).value;
    chrome.storage.local.set({ iGrade: vGrade })
    chrome.storage.local.set({ sCustomElementSelector: vCustomElementStr })
}

// Load everytime popup is triggered
function loadConfig() {
    var gradeElements = document.querySelectorAll('[id='+GradeElement+']');;
    var customElementBox = document.getElementById(CustomElement);
    if (!gradeElements || customElementBox) {
        return
    }
    chrome.storage.local.get('iGrade', function(result){
        gradeElements.forEach(e => {
            e.value = result.iGrade;
        });
    });
    chrome.storage.local.get('sCustomElementSelector', function(result){
        customElementBox.value = result.sCustomElementSelector;
    });
}

async function gradeTrigger(grade, selectElement) {
    var logStr = ""
    var btn = document.querySelectorAll(selectElement);
    
    logStr += "-> Grading With Args: \n"
                    + "\t> Points: " + grade 
                    + "\n"
                    + "\t> Target: " + selectElement
                    + "\n\n"
                + "-> Discovered: " + btn.length  + " elements. \n\n";
    for (let i = 0; i < btn.length; i++){
        if(btn[i].value=grade){
            btn[i].click();
            logStr += btn[i].id + " | ";
        }
    }
    logStr += "\n\nFinished!";
    return logStr;
}

function InjectScript() {
    var grade = document.getElementById(GradeElement).value;
    var selectElement = "input[class=MuiRating-visuallyHidden]"
    var customElement = document.getElementById(CustomElement).value;
    if (customElement){
        selectElement = customElement;
    }
    chrome.tabs.query({active: true, currentWindow: true}).then(([tab]) => {
        chrome.scripting.executeScript({
            world: "MAIN",
            args: [grade, selectElement],
            target: { tabId: tab.id },
            function: gradeTrigger,
        }).then((results) => {
            document.getElementById("logs").value=results[0].result;
        })
    })
    saveConfig();
}

window.addEventListener("DOMContentLoaded", (event) => {
    const el = document.getElementById('gradeBtn');
    if (el) {
      el.addEventListener("click", InjectScript);
    }
});
