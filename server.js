
import express from 'express'
import cookieParser from 'cookie-parser'
import path from 'path'

import { bugService } from './services/bug.service.js'
import { loggerService } from './services/logger.service.js'
import { userService } from './services/user.service.js'
import { authService } from './services/auth.servic.js'

const app = express()
//* Express Config:
app.use(express.static('public'))
//* Teach express how to use cookies
app.use(cookieParser())
app.use(express.json())
//* Teach express how to read qurey params
app.set('query parser', 'extended')

//* Express Routing:

//* Read
app.get('/api/bug', (req, res) => {
    const filterBy = {
        txt: req.query.txt || '',
        minSeverity: +req.query.minSeverity || 0,
        labels: req.query.labels || [],
        sortField: req.query.sortField || '',
        sortDir: req.query.sortDir || 'false',
        pageIdx: +req.query.pageIdx || 0,
        userId: req.query.userId || ''
    }
    bugService.query(filterBy)
        .then(({ bugs, totalPageCount }) => {
            bugService.printBugs(bugs)
            res.send({ bugs, totalPageCount })
        }
        )
        .catch(err => {
            loggerService.error('Cannot get bugs', err)
            res.status(500).send('Cannot get bugs')
        })
})

//* Create
app.post('/api/bug', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')

    const bugToSave = {
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
    }
    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//*Edit
app.put('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')

    const bugToSave = {
        _id: req.body._id,
        title: req.body.title,
        description: req.body.description,
        severity: +req.body.severity,
        createdAt: +req.body.createdAt || '',
        creator: {
            _id: req.body.creator._id,
            fullname: req.body.creator.fullname,
        }
    }
    bugService.save(bugToSave, loggedinUser)
        .then(savedBug => res.send(savedBug))
        .catch(err => {
            loggerService.error('Cannot save bug', err)
            res.status(500).send('Cannot save bug')
        })
})

//* GetById - Read
app.get('/api/bug/:bugId', (req, res) => {
    //get id from server
    const { bugId } = req.params

    let visitedBugs = req.cookies.visitedBugs || []
    loggerService.debug("User visited at the following bugs:", visitedBugs)

    if (!visitedBugs.includes(bugId)) visitedBugs.push(bugId)
    if (visitedBugs.length > 3) return res.status(401).send('Wait for a bit')

    res.cookie('visitedBugs', visitedBugs, { maxAge: 1000 * 7 })

    bugService.getById(bugId)
        .then(bug => res.send(bug))
        .catch(err => {
            loggerService.error('Cannot get bug', err)
            res.status(500).send('Cannot get bug')
        })
})

//* Remove/Delete
app.delete('/api/bug/:bugId', (req, res) => {
    const loggedinUser = authService.validateToken(req.cookies.loginToken)
    if (!loggedinUser) return res.status(401).send('Not authenticated')

    const { bugId } = req.params
    bugService.remove(bugId, loggedinUser)
        .then(() => res.send('bug Removed'))
        .catch(err => {
            loggerService.error('Cannot remove bug', err)
            res.status(500).send('Cannot remove bug')
        })
})

// USER API
app.get('/api/user', (req, res) => {``
    userService.query()
        .then(users => res.send(users))
        .catch(err => {
            loggerService.error('Cannot load users', err)
            res.status(400).send('Cannot load users')
        })
})

app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params

    userService.getById(userId)
        .then(user => res.send(user))
        .catch(err => {
            loggerService.error('Cannot load user', err)
            res.status(400).send('Cannot load user')
        })
})

// Auth API
app.post('/api/auth/login', (req, res) => {
    const credentials = req.body

    authService.checkLogin(credentials)
        .then(user => {
            const loginToken = authService.getLoginToken(user)
            res.cookie('loginToken', loginToken)
            res.send(user)
        })
        .catch(() => res.status(404).send('Invalid Credentials'))
})

app.post('/api/auth/signup', (req, res) => {
    const credentials = req.body

    userService.add(credentials)
        .then(user => {
            if (user) {
                const loginToken = authService.getLoginToken(user)
                res.cookie('loginToken', loginToken)
                res.send(user)
            } else {
                res.status(400).send('Cannot signup')
            }
        })
        .catch(err => res.status(400).send('Username taken.'))
})

app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('loginToken')
    res.send('logged-out!')
})


//* Fallback route (For production or when using browser-router)
app.get('/*all', (req, res) => {
    res.sendFile(path.resolve('public/index.html'))
})

// app.get('/', (req, res) => res.send('Hello there Thank you'))
app.listen(3030, () => console.log('Server ready at port 3030'))

