


/**
 * 
 * In the note: Share note modal has Copy button
 */
document.addEventListener("DOMContentLoaded", function () {
    var copyButton = document.getElementById("copyButton");

    copyButton.addEventListener("click", function () {
        var copyText = document.getElementById("shareSnippet");
        copyText.select();
        document.execCommand("copy");
        // alert("Copied the text: " + copyText.value); // Optional: alert message
    });
});

/**
 * 
 * In the note: shareTutorial share icon at the top generates the note share link
 * In the note: shareTutorialSection share icon at a heading generates the note section share link
 */
function shareTutorial() {
    document.getElementById("shareSnippet").value = window.location.host + window.location.pathname + `?open=${encodeURI(document.getElementById("summary-title").textContent)}`
    document.getElementById("shareModal").modal("show");
}

function shareTutorialSection(trailingHash) {
    document.getElementById("shareSnippet").value = window.location.host + window.location.pathname + `${trailingHash}`
    document.getElementById("shareModal").modal("show");
}


/**
 * 
 * In the note: setTableOfContents makes TOC menu (aka #mobile-tap) at top right appear
 */

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener("click", (event) => {
        if (!event.target.matches('#mobile-tap')) { document.querySelector('#mobile-tap').classList.remove('active'); }
    })
    document.getElementById("mobile-tap").addEventListener("click", (event) => {
        event.target.classList.toggle('active');
    });
});

function setTableOfContents(tocEl, markdownContentEl) {
    var headings = [].slice.call(markdownContentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    tocEl.innerHTML = "";

    // var debuggingHeadings = "";
    // alert(headings.length)

    headings.forEach(function (heading, i) {
        // ref is either generic (toc-1) or the jump link of the subheading
        var ref = "toc" + i;
        if (heading.hasAttribute("id"))
            ref = heading.getAttribute("id");
        else
            heading.setAttribute("id", ref);

        // alert(ref)
        var link = document.createElement("a");
        link.setAttribute("href", "#" + ref);
        link.textContent = heading.textContent;
        link.textContent = link.textContent.replaceAll("🔗", "").trim()
        link.classList.add("toc-link");

        link.addEventListener("click", () => {
            // Make up for the document title covering the heading you jumped to.
            setTimeout(() => {
                window.scrollTo({ top: window.scrollY - 60 })
            }, 100);
        })

        var div = document.createElement("div");
        div.classList.add(heading.tagName.toLowerCase());

        div.appendChild(link);
        tocEl.appendChild(div);
    });

    if (headings.length) {
        document.querySelector('#toc-toggler').classList.add('filled')
    } else {
        document.querySelector('#toc-toggler').classList.remove('filled')
    }
    // console.log(debuggingHeadings)
} // setTableOfContents

/**
 * 
 * In the note: scrollWithOffset so user sees it's been scrolled down pass the image
 */
function scrollWithOffset(element, offset = -70) {
    // Scrolls to the element smoothly
    element.scrollIntoView({ behavior: "smooth" });

    // After a slight delay, apply the offset
    window.addEventListener("scrollend", () => {
        window.scrollBy({ top: offset, left: 0, behavior: "smooth" });
        console.log("scrollend");
    }, { once: true });
} // scrollWithOffset



/**
 * Used by openNote to add image buttons into the note
 * 
 * @function enhanceWithImageButtons
 * @param {String} id "1"
 */
function enhanceWithImageButtons(img) {
    // Create a wrapper div with the specified classes
    const wrapperDiv = document.createElement('div');
    wrapperDiv.className = 'img-wrapper flex flex-row flex-start';

    // Insert the image inside the wrapper div
    img.parentNode.insertBefore(wrapperDiv, img);
    wrapperDiv.appendChild(img);

    // Create the sibling div with icons
    const iconContainer = document.createElement('div');
    iconContainer.className = 'flex flex-col justify-start';

    const iconGroupA = document.createElement('div');
    iconGroupA.className = 'flex flex-col gap-6 p-2';

    const iconGroupB = document.createElement('div');
    iconGroupB.className = 'flex flex-col gap-6 p-2';

    // Add the icons
    const icon1 = document.createElement('i');
    icon1.className = 'fas fa-columns clickable';
    icon1.onclick = (event) => {
        const imgWrapper = event.target.closest(".img-wrapper")
        const img = imgWrapper.querySelector("img");
        function removeAllStates() {
            img.classList.remove("state-1");
            img.classList.remove("state-2");
            img.classList.remove("state-3");
        }
        if (img.className.includes("state-1")) {
            removeAllStates();
            img.classList.add("state-2");
        } else if (img.className.includes("state-2")) {
            removeAllStates();
        } else {
            img.classList.add("state-1");
        }
    } // icon1

    const icon2 = document.createElement('i');
    icon2.className = 'fas fa-align-center clickable';
    icon2.onclick = (event) => {
        const imgWrapper = event.target.closest(".img-wrapper")
        const img = imgWrapper.querySelector("img");
        img.classList.toggle("centered");
    } // icon2

    iconGroupA.appendChild(icon1);
    iconGroupA.appendChild(icon2);

    const icon3 = document.createElement('i');
    icon3.className = 'fas fa-level-down-alt clickable';
    icon3.onclick = (event) => {
        const imgWrapper = event.target.closest(".img-wrapper");
        const nextLine = (imgWrapper.parentElement.id === "summary-inner" ?
            imgWrapper.nextElementSibling :
            (() => {
                let currentElement = imgWrapper;

                // Traverse up until you find the #summary-inner parent
                while (currentElement && !currentElement?.nextElementSibling) {
                    currentElement = currentElement.parentElement; // Move to the parent element
                }

                // After the loop, correctChild will hold the correct previous sibling
                // console.log(currentElement);
                const nextElementSibling = currentElement?.nextElementSibling;

                if (nextElementSibling)
                    return nextElementSibling;
                else
                    return null;
            })(imgWrapper)
        );
        // nextLine.scrollIntoView({ behavior: "smooth", top:"-40px" });
        // debugger;
        scrollWithOffset(nextLine);
    } // icon3
    iconGroupB.appendChild(icon3);

    // Append the icon div as a sibling to the image's wrapper div
    iconContainer.append(iconGroupA);
    iconContainer.append(iconGroupB);
    wrapperDiv.append(iconContainer);
}



/**
 * @function openNote
 * @param {String} id "1"
 */
function openNote(id) {
    fetch("local-open.php?id=" + id)
        .then(response => response.text()).then((yamlText) => {
            const titleMatch = yamlText.match(/^title:\s*(.*?)\n/);
            const htmlMatch = yamlText.match(/^html:\s*\|([\s\S]*)/m);

            // Extract the title
            let title = titleMatch ? titleMatch[1].replace(/^ {2}/gm, '') : null;
            title = title?.replace(/\.md$/i, ""); // Remove .md from the title
            title = title?.replace(/\.json$/i, ""); // Remove .md from the title
            if (!title) { title = ""; }

            // Extract and clean up HTML content
            let summary = htmlMatch ? htmlMatch[1].replace(/^ {2}/gm, '') : null;

            parent.document.querySelector(".side-by-side-possible.hidden")?.classList?.remove("hidden");

            // Show notes in textarea

            let summaryInnerEl = parent.document.querySelector("#summary-inner");
            summaryInnerEl.classList.remove("hidden");

            var md = window.markdownit({
                html: true,
                linkify: true
            }).use(window.MarkdownItLatex)
                .use(window.markdownItAnchor, {
                    level: [1, 2, 3, 4, 5, 6], // Apply to all heading levels
                    slugify: function (s) {
                        return s.replace(/\s+/g, '-').replace(/[^a-zA-Z0-9\-]/g, '');
                    },
                    permalink: true,
                    permalinkHref: (slug, state) => {
                        let s = slug;
                        s = "javascript:window.shareTutorialSection('?open=" + encodeURI(title) + "#" + s + "');"; // ?open=Data%20Lake.md#Section1
                        return s;
                    },
                    permalinkSymbol: '🔗' // Set to true if you want a permalink symbol
                    // Other options as needed
                });

            // md.renderer.rules.newline = (tokens, idx) => {
            //     return '\n';
            // };

            // Fixes: I have separate lines in md format. How come they're run-on's when rendered with markdown?
            // Principle: Markdown's Line Break Rules: In Markdown, simply pressing "Enter" once at the end of a line does not create a new paragraph or line break in the rendered output. Instead, lines directly below each other without an empty line between them are treated as part of the same paragraph and are joined together.
            // Solution: Add two spaces at the end of each line to force a line break, unless the adjacent line is a blank line.
            summary = (function doubleNewLine(text) {
                return text.replace(/(.+)(\n)(?!\n)/g, "$1  \n");
            })(summary);

            function convertNotesToDetails(inputText) {
                const lines = inputText.split('\n');
                const outputLines = [];
                let i = 0;

                while (i < lines.length) {
                    const line = lines[i];
                    const noteMatch = line.match(/^>\s*\[!note\]\s*(.*)$/i);

                    if (noteMatch) {
                        // Start of a note block
                        const summaryText = noteMatch[1].trim();
                        const contentLines = [];

                        i++;
                        // Collect the content lines that start with '>'
                        while (i < lines.length && lines[i].startsWith('>')) {
                            const contentLine = lines[i].replace(/^>\s*/, ''); // Remove '>' and possible spaces
                            contentLines.push(contentLine);
                            i++;
                        }

                        const content = contentLines.join('\n');
                        const detailsHtml = `<details>\n<summary>${summaryText}</summary>\n<div class="border ml-3 p-1">${content}</div>\n</details><br/>`;
                        outputLines.push(detailsHtml);
                    } else {
                        outputLines.push(line);
                        i++;
                    }
                }

                return outputLines.join('\n');
            }  // convertNotesToDetails

            summary = convertNotesToDetails(summary);

            var summaryHTML = md.render(summary);

            document.getElementById("summary-title").textContent = title;
            document.getElementById("summary-collapser").classList.remove("hidden");
            document.getElementById("summary-collapser").classList.add("stated");
            document.getElementById("summary-sharer").classList.remove("hidden");
            document.getElementById("summary-outer").classList.remove("hidden");
            // parent.document.querySelector("#dashboard").classList.add("active");

            // When copied HTML from W3School to Obsidian, it's a special space character. 
            // This special space character will get rid of // from https:// in src
            // So lets convert back to typical space

            summaryHTML = summaryHTML.replaceAll(/\xA0/g, " ");

            function replaceBracketsWithLinks(htmlString) {
                return htmlString.replace(/\[\[(.*?)\]\]/g, function (match, p1) {
                    const encodedText = encodeURIComponent(p1); // To handle special characters in URLs
                    return `<a target="_blank" href="${window.openURL}${encodedText}">${p1}</a>`;
                });
            }
            summaryHTML = replaceBracketsWithLinks(summaryHTML);


            summaryInnerEl.innerHTML = summaryHTML;

            setTimeout(() => {
                // target blank for links
                summaryInnerEl.querySelectorAll("a").forEach(a => {
                    if (a.href.includes(window.openURL) || a.href.includes("localhost") || a.innerText.includes("🔗"))
                        return true;

                    a.setAttribute("target", "_blank");

                    // Youtube Embeds
                    (function () {
                        // Exit quickly if this is the wrong type of URL
                        if (this.protocol !== 'http:' && this.protocol !== 'https:') {
                            return;
                        }

                        // Find the ID of the YouTube video
                        var id, matches;
                        if (this.hostname === 'youtube.com' || this.hostname === 'www.youtube.com') {
                            // For URLs like https://www.youtube.com/watch?v=xLrLlu6KDss
                            // debugger;
                            matches = this.search.match(/[?&]v=([^&]*)/);
                            id = matches && matches[1];
                        } else if (this.hostname === 'youtu.be') {
                            // For URLs like https://youtu.be/xLrLlu6KDss
                            id = this.pathname.substr(1);
                        }
                        // console.log({ hostname: this.hostname })

                        // Check that the ID only has alphanumeric characters, to make sure that
                        // we don't introduce any XSS vulnerabilities.
                        var validatedID;
                        if (id && id.match(/^[a-zA-Z0-9\_]*$/)) {
                            validatedID = id;
                        }

                        // Add the embedded YouTube video, and remove the link.
                        if (validatedID) {
                            $(this)
                                .before('<div class="responsive-iframe-container"><iframe src="https://www.youtube.com/embed/' + validatedID + '" frameborder="0" allowfullscreen></iframe></div>')
                                .remove();
                        }

                    }).call(a);

                }) // for all a in the tutorial
            }, 250);

            // Scroll up
            // Jump up to content
            // window.document.getElementById("summary-title").scrollIntoView();
            window.document.getElementById("explore-curriculum").scrollIntoView({
                behavior: "smooth",
            });

            // Image buttons
            window.document
                .querySelector("#summary-inner")
                .querySelectorAll('img').forEach(img => {
                    enhanceWithImageButtons(img);
                });

            // Render table of contents at top right
            let tocEl = window.document.querySelector("#toc")
            let markdownContentEl = window.document.querySelector("#summary-inner")
            setTableOfContents(tocEl, markdownContentEl);

            // Add progress markers on the left
            const notePanel = window.document.querySelector("#summary-inner");
            const parentWindow = window;
            parentWindow.removeScrollProgressMarkers(notePanel);
            parentWindow.hydrateAnimationOnProgressMarkers(notePanel);
            parentWindow.addScrollProgressMarkers(notePanel);

            // If had been collapsed, make it not collapsed
            var summaryCollapser = document.getElementById("summary-collapser");
            if (!summaryCollapser.className.includes("stated")) {
                summaryCollapser.click();
            }

        }) // fetch md
}; // openNote


function addScrollProgressMarkers(div) {
    const windowHeight = window.innerHeight;
    const divHeight = div.scrollHeight;
    let percentageMarkers = [];

    // Determine how many markers to add based on div height vs. window height
    if (divHeight > 3 * windowHeight) {
        percentageMarkers = [10, 20, 30, 40, 50, 60, 70, 80, 90];
    } else if (divHeight > 2 * windowHeight) {
        percentageMarkers = [25, 50, 75];
    } else if (divHeight > windowHeight) {
        percentageMarkers = [33, 66];
    }

    // Create marker elements and position them
    percentageMarkers.forEach(percentage => {
        const marker = document.createElement('div');
        marker.classList.add('scroll-marker');
        marker.style.top = `${(percentage / 100) * divHeight}px`;
        marker.textContent = `${percentage}%`;

        div.appendChild(marker);
    });

} // addScrollProgressMarkers

function hydrateAnimationOnProgressMarkers(div) {
    window.addEventListener('scroll', hydrateAnimationScrollHandler.bind(this, div));
    window.addEventListener('resize', () => {

        removeScrollProgressMarkers();
        addScrollProgressMarkers(div);
        hydrateAnimationScrollHandler(div);

    });
} // hydrateAnimationOnProgressMarkers

function hydrateAnimationScrollHandler(div) {
    // Update markers' opacity based on scroll position, with only those in top quarter visible
    const divRect = div.getBoundingClientRect(); // Get div's position relative to viewport
    document.querySelectorAll('.scroll-marker').forEach((marker, i) => {
        const markerRect = marker.getBoundingClientRect(); // Marker position relative to viewport

        // Check if marker falls within the top quarter of the viewport
        if (markerRect.top <= window.innerHeight / 4) {
            marker.classList.add("past");
        } else {
            marker.classList.remove("past");
        }
    });
} // hydrateAnimationScrollHandler

function removeScrollProgressMarkers(div) {
    // Select all markers within the div
    const markers = document.querySelectorAll('.scroll-marker');

    // Remove each marker element
    markers.forEach(marker => marker.remove());

    // Optionally, remove the scroll event listener if it's no longer needed
    window.removeEventListener('scroll', hydrateAnimationScrollHandler);
} // removeScrollProgressMarkers
