console.log("Email writer extension: Content script loaded");

function getEmailContent() {
    const selectors = [
        '.h7', // Subject line
        '.a3s.aiL', // Email body content
        '.gmail_quote', // Quoted email content
        '[role="toolbar"]' // Toolbar (fallback)
    ];

    for (const selector of selectors) {
        const content = document.querySelector(selector);
        if (content) {
            return content.innerText.trim();
        }
    }
    return ''; // Fallback if no content is found
}

function createAIButton() {
    const button = document.createElement('div');
    button.className = 'T-I J-J5-JI ao0 v7 T-I-atl L3';
    button.style.marginRight = '8px';
    button.innerHTML = 'AI Reply';
    button.setAttribute('role', 'button');
    button.setAttribute('data-tooltip', 'Generate AI Reply');
    return button;
}

function findComposeToolbar() {
    const selectors = [
        '.btC', // Compose box
        '.aDh', // Compose toolbar
        '[role="toolbar"]', // General toolbar
        '.gU.Up' // Send and formatting toolbar
    ];

    for (const selector of selectors) {
        const toolbar = document.querySelector(selector);
        if (toolbar) {
            return toolbar;
        }
    }
    return null;
}

function injectButton() {
    const existingButton = document.querySelector('.ai-reply-button');
    if (existingButton) existingButton.remove();

    const toolbar = findComposeToolbar();
    if (!toolbar) {
        console.log("Compose toolbar not found");
        return;
    }

    console.log("Compose toolbar found, adding AI button");
    const button = createAIButton();
    button.classList.add('ai-reply-button');

    button.addEventListener('click', async () => {
        try {
            button.innerHTML = 'Generating...';
            button.disabled = true;

            const emailContent = getEmailContent();
            const response = await fetch('http://localhost:8089/api/email/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    emailContent: emailContent,
                    tone: "professional"
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate AI reply');
            }

            const generatedReply = await response.text();
            const composeBox = document.querySelector('[role="textbox"][contenteditable="true"]');
            if (composeBox) {
                composeBox.focus();
                document.execCommand('insertText', false, generatedReply);
            } else {
                console.error('Compose box not found');
            }
        } catch (error) {
            console.error('Error generating AI reply:', error);
        } finally {
            button.innerHTML = 'AI Reply';
            button.disabled = false;
        }
    });

    toolbar.insertBefore(button, toolbar.firstChild);
}

// Monitor Gmail's dynamic DOM updates
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const addedNodes = Array.from(mutation.addedNodes);
        const hasComposeElements = addedNodes.some(node =>
            node.nodeType === Node.ELEMENT_NODE &&
            (node.matches('.aDh, .btC[role="dialog"]') || node.querySelector('[role="dialog"]'))
        );

        if (hasComposeElements) {
            console.log("Compose window detected");
            setTimeout(injectButton, 500);
        }
    }
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
