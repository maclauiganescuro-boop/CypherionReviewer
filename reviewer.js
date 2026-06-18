import * as pdfjsLib from "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.min.mjs";

pdfjsLib.GlobalWorkerOptions.workerSrc =
"https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/pdf.worker.min.mjs";

const subjectNames = {
    'data-structure-and-algorithms': 'Data Structure and Algorithms',
    'networking-1': 'Networking 1',
    'it-elective-1': 'IT Elective 1',
    'it-elective-2': 'IT Elective 2',
    'information-management': 'Information Management',
    'computer-maintenance-and-troubleshooting': 'Computer Maintenance and Troubleshooting'
};

const params = new URLSearchParams(window.location.search);
const subjectKey = params.get('subject') || '';
const subjectTitle =
    subjectNames[subjectKey] ||
    (subjectKey ? subjectKey : 'Subject');

const pdfPath =
    'reviewers/' +
    (subjectKey || 'reviewer') +
    '.pdf';

document.getElementById('subject-title').textContent =
    subjectTitle;

document.getElementById('expected-path').textContent =
    pdfPath;

const stateLoading =
    document.getElementById('state-loading');

const stateEmpty =
    document.getElementById('state-empty');

const stateViewer =
    document.getElementById('state-viewer');

function showState(el){
    [stateLoading,stateEmpty,stateViewer]
    .forEach(s => s.classList.remove('active'));

    el.classList.add('active');
}

let currentPdf = null;
let currentScale = 1.3;

async function renderPDF(url){

    const container =
        document.getElementById("pdf-pages");

    container.innerHTML = "";

    const pdf =
        await pdfjsLib.getDocument(url).promise;

    currentPdf = pdf;

    for(let pageNum = 1; pageNum <= pdf.numPages; pageNum++){

        const page =
            await pdf.getPage(pageNum);

        const viewport =
            page.getViewport({
                scale: currentScale
            });

        const canvas =
            document.createElement("canvas");

        const ctx =
            canvas.getContext("2d");

        canvas.width =
            viewport.width;

        canvas.height =
            viewport.height;

        canvas.classList.add("pdf-page");

        container.appendChild(canvas);

        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
    }
}

async function rerender(){

    if(currentPdf){

        const container =
            document.getElementById("pdf-pages");

        container.innerHTML = "";

        for(let pageNum = 1;
            pageNum <= currentPdf.numPages;
            pageNum++){

            const page =
                await currentPdf.getPage(pageNum);

            const viewport =
                page.getViewport({
                    scale: currentScale
                });

            const canvas =
                document.createElement("canvas");

            const ctx =
                canvas.getContext("2d");

            canvas.width =
                viewport.width;

            canvas.height =
                viewport.height;

            canvas.classList.add("pdf-page");

            container.appendChild(canvas);

            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;
        }
    }
}

fetch(pdfPath,{method:'HEAD'})
.then(res => {

    if(res.ok){

        document.getElementById('file-name')
        .textContent =
        subjectTitle + ' Reviewer.pdf';

        document.getElementById('download-btn')
        .href = pdfPath;

        document.getElementById('download-btn')
        .download = subjectKey + '.pdf';

        showState(stateViewer);

        renderPDF(pdfPath);

    }else{

        showState(stateEmpty);

    }

})
.catch(() => showState(stateEmpty));

document
.getElementById("zoom-in")
.addEventListener("click",async()=>{

    currentScale += 0.2;

    await rerender();

});

document
.getElementById("zoom-out")
.addEventListener("click",async()=>{

    if(currentScale > 0.6){

        currentScale -= 0.2;

        await rerender();
    }

});

window.addEventListener("resize",()=>{

    rerender();

});