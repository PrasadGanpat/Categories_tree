var root = document.documentElement,
    toolBar = document.querySelector('[role="toolbar"]'),
    alertRoot = document.querySelector('[data-js="deleteNode"].root'),
    alertConfirm = document.querySelector('[data-js="deleteNode"].confirm'),
    node = ["type here"];

document.addEventListener('click', function(e) {
    var clickType = e.target.getAttribute('data-js');
    // User has selected a node
    if (clickType === 'node') {
        selectNode(e);
    } else if (clickType !== '' && clickType !== null) {
        // Buttons within the toolbar, at the top of the page
        if (clickType === 'addChild') addChild();
        else if (clickType === 'deleteNode') deleteNode(e);
        else if (clickType === 'editName') editName();
    } else {
        // User has clicked outside of a node
        deselectNodes();
        hideToolbar();
    }
});

function lineColor(e) {
    root.style.setProperty('--line-color', e.target.value);
}

function lineWidth(e) {
    root.style.setProperty('--line-width', (e.target.value / 10) + 'em');
}

function gutterWidth(e) {
    root.style.setProperty('--gutter', (e.target.value / 10) + 'em');
}

function selectNode(e) {
    var clicker = e.target;
    // Hang on - do we need to do anything?
    if (clicker.getAttribute('aria-pressed') === 'false') {
        deselectNodes();
        clicker.setAttribute('aria-pressed', 'true');
        clicker.classList.add('selected');
        showToolbar();
    }
}

// Bit of cleanup, after the user has finished editing the tree.
function deselectNodes() {
    // This needs to run from scratch as new nodes might have been added
    var selectedBtns = [...document.querySelectorAll('.tree [aria-pressed="true"]')],
        btnDelete = document.querySelector('[data-js="deleteNode"]'),
        editBtns = [...document.querySelectorAll('.tree [contenteditable]')];
    // I mean, in theory, there should only be one selected button, but, you know, bugs...
    for (var i = 0; i < selectedBtns.length; i++) {
        selectedBtns[i].setAttribute('aria-pressed', 'false');
        selectedBtns[i].classList.remove('selected');
    }
    // Bit of cleanup, in case the user noped out of deleting a node
    if (btnDelete.classList.contains('js-confirm')) {
        btnDelete.classList.remove('js-confirm');
        alertConfirm.setAttribute('aria-hidden', 'true');
    }
    if (btnDelete.classList.contains('js-root')) {
        btnDelete.classList.remove('js-root');
        alertRoot.setAttribute('aria-hidden', 'true');
    }
    // Checks for new nodes which are editable, then turns them off.
    for (var i = 0; i < editBtns.length; i++) {
        editBtns[i].removeAttribute('contenteditable');
    }
}

function showToolbar() {
    toolBar.removeAttribute('aria-hidden');
    toolBar.classList.add('show');
}

function hideToolbar() {
    toolBar.setAttribute('aria-hidden', 'true');
    toolBar.classList.remove('show');
}

/// Adding custom function
function Collapser(e) {
    // Make sure the tags are setup correctly, if not just return
    if (!e.parentNode.getElementsByTagName("ul")[0]) return;
    var x = e.parentNode.getElementsByTagName("ul")[0];
    // if already visible, make disappear, otherwise reappear
    x.style.display = (x.style.display == "") ? 'none' : "";

}

// Adds a new node under the current node
function addChild() {
    if (document.querySelector('.tree .selected')) {
        var chosenNode = document.querySelector('.tree .selected').parentNode,
            listItem = document.createElement('li');
        listItem.innerHTML = '<button type="button" aria-pressed="false" data-js="node" contenteditable="true" onclick="Collapser(this)">' +
            node[Math.round(Math.random() * (node.length - 1))] + '</button>';
        // The current node already has kids
        if (chosenNode.querySelector('ul')) {
            var chosenKids = chosenNode.querySelector('ul');
            chosenKids.appendChild(listItem);
            chosenKids.lastChild.querySelector('button').focus();
        } else { // The current node has no kids
            var newDad = document.createElement('ul');
            newDad.appendChild(listItem);
            chosenNode.appendChild(newDad);
            chosenNode.lastChild.querySelector('button').focus();
        }
    }
}

// Removes the node and it's children
function deleteNode(e) {
    var chosenChild = document.querySelector('.tree  .selected'),
        delButton = e.target,
        isRoot = chosenChild.parentNode.parentNode.classList.contains('tree');

    // Is the user trying to delete the root node?
    if (isRoot) {
        delButton.classList.add('js-root');
        alertRoot.removeAttribute('aria-hidden');
    }
    // Has the user clicked the delete button once already?
    else if (delButton.classList.contains('js-confirm')) {
        // Is there more than one sibling?
        if (chosenChild.parentNode.parentNode.childElementCount > 1) {
            chosenChild.parentNode.remove();
        } else { // Remove the whole list
            chosenChild.parentNode.parentNode.remove();
        }
        deselectNodes();
        hideToolbar();
    } else {
        delButton.classList.add('js-confirm');
        alertConfirm.removeAttribute('aria-hidden');
    }
}


// Allows the user to rename existing nodes
function editName() {
    console.log('Hello');
    var chosenChild = document.querySelector('.tree .selected');
    chosenChild.setAttribute('contenteditable', 'true');
    chosenChild.focus();
}


// Because each node is a button tag, the space bar event is captured, when the user is editing.
// This is used as a work-around.
function insertTextAtCursor(text) {
    var sel, range;
    if (window.getSelection) {
        sel = window.getSelection();
        if (sel.getRangeAt && sel.rangeCount) {
            range = sel.getRangeAt(0);
            range.deleteContents();
            range.insertNode(document.createTextNode(text));
        }
    } else if (document.selection && document.selection.createRange) {
        document.selection.createRange().text = text;
    }
}

