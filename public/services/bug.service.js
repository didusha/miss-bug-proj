import { utilService } from './util.service.js'
// import { storageService } from './async-storage.service.js'

const STORAGE_KEY = 'bugs'
const BASE_URL = '/api/bug/'

_createBugs()

export const bugService = {
    query,
    getById,
    save,
    remove,
    getDefaultFilter
}

function query(filterBy = {}) {
    return axios.get(BASE_URL, { params: filterBy })
        .then(res => res.data)
}

function getById(bugId) {
    return axios.get(BASE_URL + bugId)
        .then(res => res.data)
        .catch(err => {
            if (err.response && err.response.status === 401) {
                console.log(err.response.data)
            } else {
                console.error('Unexpected error:', err)
            }
            throw err
        })
}

function remove(bugId) {
    return axios.delete(BASE_URL + bugId)
        .then(res => res.data)
}

function save(bug) {
    // const method = bug._id ? put: post
    if (bug._id) {
        return axios.put(BASE_URL + bug._id, bug)
            .then(res => res.data)
    } else {
        return axios.post(BASE_URL, bug)
            .then(res => res.data)
    }


    // return axios.get(BASE_URL + 'save', { params: bug }).then(res => res.data)
}

function _createBugs() {
    let bugs = utilService.loadFromStorage(STORAGE_KEY)
    if (bugs && bugs.length > 0) return

    bugs = [
        {
            title: "Infinite Loop Detected",
            severity: 4,
            _id: "1NF1N1T3"
        },
        {
            title: "Keyboard Not Found",
            severity: 3,
            _id: "K3YB0RD"
        },
        {
            title: "404 Coffee Not Found",
            severity: 2,
            _id: "C0FF33"
        },
        {
            title: "Unexpected Response",
            severity: 1,
            _id: "G0053"
        }
    ]
    utilService.saveToStorage(STORAGE_KEY, bugs)
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, sortField: '', sortDir: false, labels: [], pageIdx: 0 }
}

function _setNextPrevBugId(bug) {
    return query()
        .then((bugs) => {
            const bugIdx = bugs.findIndex(currBug => currBug._id === bug._id)
            const nextBug = bugs[bugIdx + 1] ? bugs[bugIdx + 1] : bugs[0]
            const prevBug = bugs[bugIdx - 1] ? bugs[bugIdx - 1] : bugs[bugs.length - 1]
            bug.nextBugId = nextBug._id
            bug.prevBugId = prevBug._id
            return bug
        })
}

// function getFilterFromSearchParams(searchParams) {
//     const txt = searchParams.get('txt') || ''
//     const minSeverity = searchParams.get('minSeverity') || ''
//     const sortField = searchParams.get('sortField') || ''
//     const sortDir = searchParams.get('sortDir') || -1
//     return {
//         txt,
//         minSeverity,
//         sortField,
//         sortDir
//     }
// }