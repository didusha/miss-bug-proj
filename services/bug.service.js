import fs from 'fs'
import PDFDocument from 'pdfkit-table'
import { makeId, readJsonFile } from "./util.service.js";

let gbugs = readJsonFile('data/bug.json')
const PAGE_SIZE = 3

export const bugService = {
    query,
    getById,
    remove,
    save,
    printBugs
}

function query(filterBy = { txt: '', minSeverity: 0, labels: [], sortField: 'severity', sortDir: false }) {

    let bugs = [...gbugs]
    if (filterBy.txt) {
        const regExp = new RegExp(filterBy.txt, 'i')
        bugs = bugs.filter(bug => regExp.test(bug.title) || regExp.test(bug.description))
    }

    if (filterBy.labels && filterBy.labels.length > 0) {
        bugs = bugs.filter(bug => bug.labels.some(label => filterBy.labels.includes(label)))
    }

    if (filterBy.minSeverity) {
        bugs = bugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.pageIdx !== undefined) {
        const startIdx = filterBy.pageIdx * PAGE_SIZE
        bugs = bugs.slice(startIdx, startIdx + PAGE_SIZE)
    }

    console.log("🚀 ~ query ~ filterBy:", filterBy)
    if (filterBy.sortField) {
        const dir = filterBy.sortDir === 'true' ? 1 : -1

        if (filterBy.sortField === 'createdAt') {
            bugs.sort((b1, b2) => dir * (b1.createdAt - b2.createdAt))
        } else if (filterBy.sortField === 'title') {
            bugs.sort((b1, b2) => dir * b1.title.localeCompare(b2.title))
        } else if (filterBy.sortField === 'severity') {
            bugs.sort((b1, b2) => dir * (b1.severity - b2.severity))
        }
    }

    return Promise.resolve(bugs)
}

function getById(bugId) {
    const bug = gbugs.find(bug => bug._id === bugId)
    if (!bug) return Promise.reject('Cannot find bug - ' + bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    const bugIdx = gbugs.findIndex(bug => bug._id === bugId)
    if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
    gbugs.splice(bugIdx, 1)
    return _saveBugsToFile()
}

function save(bugToSave) {
    if (bugToSave._id) {
        const bugIdx = gbugs.findIndex(bug => bug._id === bugToSave._id)
        if (bugIdx === -1) return Promise.reject('Cannot find bug - ' + bugId)
        gbugs[bugIdx] = bugToSave
    } else {
        bugToSave.createdAt = Date.now()
        bugToSave._id = makeId()
        gbugs.unshift(bugToSave)
    }
    return _saveBugsToFile().then(() => bugToSave)
}

function _saveBugsToFile() {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify(gbugs, null, 4)
        fs.writeFile('data/bug.json', data, (err) => {
            if (err) {
                return reject('Cannot write to file')
            }
            console.log('Wrote Successfully!')
            resolve()
        })
    })
}

function printBugs(bugs) {
    // init document
    let doc = new PDFDocument({ margin: 'auto', size: 'A4' })
    // connect to a write stream
    doc.pipe(fs.createWriteStream('./bugs.pdf'))
    createPdf(doc, bugs)
        .then(() => doc.end()) // close document
        .catch(err => console.error('PDF creation failed:', err))
}

function createPdf(doc, bugs) {
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
    return doc.table(table, { columnsSize: [150, 50, 200, 100] })
}
