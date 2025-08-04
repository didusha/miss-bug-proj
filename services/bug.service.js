import fs from 'fs'
import PDFDocument from 'pdfkit-table'
import { makeId, readJsonFile } from "./util.service.js";

const bugs = readJsonFile('data/bug.json')

export const bugService = {
    query,
    getById,
    remove,
    save,
    printBugs
}

function query() {
    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bug = bugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = bugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
    bugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = bugs.findIndex(bug => bug._id === bugToSave._id)
        if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
        bugs[bugIdx] = bugToSave
    } else {
        bugToSave._id = makeId()
        bugs.unshift(bugToSave)
    }
    return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(bugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                return reject(err)
            }
            resolve()
        })
    })
}

function printBugs(bugs) {
    // init document
    let doc = new PDFDocument({ margin: 'auto', size: 'A4' })
    // connect to a write stream
    doc.pipe(fs.createWriteStream('./bugs.pdf'))
    createPdf(doc,bugs)
        .then(() => doc.end()) // close document
        .catch(err => console.error('PDF creation failed:', err))
}

function createPdf(doc, bugs){
    const table = {
        title: 'Bugs',
        subtitle: 'Sorted by severity',
        headers: ['Title', 'Severity', 'Description', 'Created'],
        rows: bugs.map(bug => [
            bug.title,
            bug.severity,
            bug.description,
            new Date(bug.createdAt).toLocaleString(),
        ])
    }
    return doc.table(table, { columnsSize: [ 150, 50, 200, 100 ]})
}
