
const mainUI = document.getElementById("main-ui");

function main() {
    logseq.Editor.registerSlashCommand(
        "Search on Wikipedia",
        async () => {
            const {
                left, top, rect
            } = await logseq.Editor.getEditingCursorPosition();
            console.log([left, top, rect]);
            Object.assign(mainUI.style, {
                top: top + rect.top + "px",
                left: left + rect.left + "px",
            });
            logseq.showMainUI();
        },
    )
}

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        logseq.hideMainUI({ restoreEditingCursor: true })
    };
    e.stopPropagation()
})

// const testButton = document.getElementById("test-button");
// testButton.addEventListener("click", async () => {
//     const currentBlock = await logseq.Editor.getCurrentBlock();
//     await logseq.Editor.insertBlock(currentBlock.uuid, "dick");
// })

// update content
const listItems = document.querySelector("#left-section > nav > ul");
const rightSection = document.getElementById("right-section");
const searchBar = document.getElementById("search-bar");

function clearItems() {
    while (listItems.firstChild) {
        listItems.removeChild(listItems.lastChild);
    };

    while (rightSection.firstChild) {
        rightSection.removeChild(rightSection.lastChild);
    };
}

function delay(func, time) {
    let timer = 0;
    return function (...args) {
        clearTimeout(timer);
        timer = setTimeout(func.bind(this, ...args), time || 0)
    }
}

searchBar.addEventListener("keyup", delay(function (e) {
    updateItems(searchBar.value);
}, 250));

function updateItems(keyword) {
    const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/page?q=${keyword}&limit=5`;

    //https://en.wikipedia.org/api/rest_v1/page/summary/

    fetch(searchUrl)
        .then(res => res.json())
        .then(data => {
            updateItemTitle(data)
        })
};

function updateItemContent(url) {
    return fetch(url)
        .then(res => res.json())
        .then(data => {
            rightSection.insertAdjacentHTML("beforeend",
                `<div style="display:none">
                <p>${data.extract}</p>
                <button>Insert</button>
                </div>`);

            const lastItem = listItems.lastChild;
            const lastItemContentContainer = rightSection.lastChild;

            lastItem.addEventListener("mouseover", () => {
                lastItemContentContainer.style.display = "block";
            });
            // lastItem.addEventListener("mouseout", () => {
            //     lastItemContentContainer.style.display = "none";
            // });
            
            lastItemContentContainer.querySelector("button").addEventListener("click", async () => {
                const content = lastItemContentContainer.querySelector("p").textContent;
                const currentBlock = await logseq.Editor.getCurrentBlock();
                await logseq.Editor.insertBlock(currentBlock.uuid, content);
            })
        })
}

async function updateItemTitle(data) {
    clearItems();

    for (const entry of data.pages) {
        listItems.insertAdjacentHTML("beforeend", `<li>${entry.title}</li>`);

        const summaryUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${entry.key}`;

        await updateItemContent(summaryUrl);
    }
}

// bootstrap
logseq.ready(main).catch(console.error)
