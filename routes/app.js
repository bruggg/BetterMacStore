const User = require('../models/User');
const Application = require('../models/Application');
const Release = require('../models/ReleaseNotes');
const Image = require('../models/Image');
require('dotenv').config()
const express = require('express');
const router = express.Router()
const bcrypt = require('bcryptjs');
const passport = require('passport')
const Name = process.env.NAME
const funcs = require('../config/functions');
const he = require('he');
const fs = require('fs');
const wasabi = require('../config/wasabi')
const csrf = require('csurf')
const rl = require('../config/rateLimit');
const {
    fstat
} = require('fs');

const csrfProtection = csrf({
    cookie: true
})

var about = {}
router.get('/*', async function (req, res, next) {
    // add language variables to EJS file
    about = funcs.language(req.user, req.cookies.language)

    // define some defaults for the EJS files
    about.name = Name
    about.path = req.path
    about.loggedin = await funcs.loggedin(req.user)
    about.staff = funcs.staff(req.user)
    about.user = req.user
    about.navbar = true
    about.footer = true
    about.analytics = process.env.ANALYTICS
    about.ga = process.env.GA_CODE

    next()
});

router.get('/new', csrfProtection, async function (req, res, next) {
    // if no user, redirect to login page
    funcs.needLoggedin(req.user, res, next)

    about.title = 'Release an App'
    about.template = 'app/new'
    about.csrf = req.csrfToken()

    return res.render('base', about);
})

router.get('/icon/:appId', csrfProtection, async function (req, res, next) {
    // if no user, redirect to login page
    const appId = req.params.appId

    const icon = await Image.findOne({
        app: appId,
        type: 'icon'
    })

    res.redirect(icon.url)
})

/** Absolute mess, needs redone first */
router.post('/new', csrfProtection, rl.min_1, async function (req, res, next) {
    // if no user, redirect to login page
    funcs.needLoggedin(req.user, res, next)

    // get data from the request body
    const myOrgs = req.user.developer.organizations
    var org = req.body.org
    const name = req.body.name
    const description = req.body.description
    const tags = req.body.tags.split(',').map(Function.prototype.call, String.prototype.trim)
    const category = req.body.category
    const appId = Math.floor(1000000 + Math.random() * 9000000)

    const wasabiAppFile = req.files.app.tempFilePath.split('/')
    const wasabiZipFile = req.files.zip.tempFilePath.split('/')

    uploadZip()

    function uploadZip() {
        if (fs.existsSync(req.files.zip.tempFilePath)) {
            wasabi.uploadFile(req.files.zip.tempFilePath)
        } else {
            uploadZip()
        }
    }

    uploadApp()

    function uploadApp() {
        if (fs.existsSync(req.files.app.tempFilePath)) {
            wasabi.uploadFile(req.files.app.tempFilePath)
        } else {
            uploadApp()
        }
    }

    // BEGIN: check to see if user has access to the organization the app will be made for
    myOrgs.push('me')

    if (!myOrgs.includes(org)) {
        return res.send('Error: you are not part of the ' + he.encode(org) + ' organization<br><br>Tip: you can just press the back button and the input fields will have your inputed data ;)')
    }

    organization = true
    var organizationId = org

    if (org == 'me') {
        org = 'View Developer'
        organization = false
        organizationId = req.user._id
    }
    // END: check to see if user has access to the organization the app will be made for

    // create a new application template
    const newApp = new Application({
        meta: {
            developer: org,
            org: organization,
            orgId: organizationId,
            name: name,
            description: description,
            creationDate: Date.now(),
            tags: tags,
            category: funcs.categoryName(category)
        },
        unique: {
            appId: appId
        }
    })

    // this will be the initial release for the app
    // recieve more data from request body
    const version = req.body.version
    const releaseTitle = req.body.title
    const releaseNotes = req.body.notes

    // create a new release template
    const newRelease = new Release({
        app: appId,
        version: version,
        description: releaseNotes,
        title: releaseTitle,
        creationDate: Date.now(),
        binaries: {
            app: `https://s3.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/${wasabiAppFile[wasabiAppFile.length -1]}`,
            zip: `https://s3.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/${wasabiZipFile[wasabiZipFile.length -1]}`
        },
    })

    // check if a dmg was uploaded
    if (req.files.dmg) {
        uploadDmg()

        function uploadDmg() {
            if (fs.existsSync(req.files.dmg.tempFilePath)) {
                wasabi.uploadFile(req.files.dmg.tempFilePath)
            } else {
                uploadDmg()
            }
        }

        const wasabiDmgFile = req.files.dmg.tempFilePath.split('/')

        // if so, add it to the template
        newRelease.binaries.dmg = `https://s3.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/${wasabiDmgFile[wasabiDmgFile.length -1]}`
    }

    uploadIcon()
    var iconName = req.files.icon.tempFilePath.split('/')

    function uploadIcon() {
        if (fs.existsSync(req.files.icon.tempFilePath)) {
            wasabi.uploadFile(req.files.icon.tempFilePath)
        } else {
            uploadIcon()
        }
    }

    // create new app icon template
    const newIcon = new Image({
        app: appId,
        type: 'icon',
        creationDate: Date.now(),
        url: `https://s3.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/${iconName[iconName.length -1]}`
    })

    // save the icon
    newIcon.save()

    // for each screenshot uploaded, create a new object in the database
    for (i = 0; i < req.files.screenshots.length; i++) {
        var screenName = req.files.screenshots[i].tempFilePath.split('/')
        uploadScreens()

        function uploadScreens() {
            if (fs.existsSync(req.files.screenshots[i].tempFilePath)) {
                wasabi.uploadFile(req.files.screenshots[i].tempFilePath)
            } else {
                uploadScreens()
            }
        }

        const newImage = new Image({
            app: appId,
            type: 'screenshot',
            creationDate: Date.now(),
            url: `https://s3.wasabisys.com/${process.env.WASABI_BUCKET_NAME}/${screenName[screenName.length -1]}`
        })

        newImage.save()
    }

    // update the latest release info
    newApp.meta.latestRelease = newRelease._id

    newRelease.save().then(release => {
        newApp.save().then(app => {
            return res.redirect('/app/' + app.unique.appId)
        })
    })
})

router.get('/:id', async function (req, res, next) {
    // find the actual app data
    const app = await Application.findOne({
        'unique.appId': req.params.id
    })

    // find all the releases for the app
    const releases = await Release.find({
        app: req.params.id
    })

    // finds the icon for the app
    const icon = await Image.findOne({
        app: req.params.id,
        type: 'icon'
    })

    // finds the screenshots for the app
    const screenshots = await Image.find({
        app: req.params.id,
        type: 'screenshot'
    })

    about.title = app.meta.name
    about.app = app
    about.icon = icon
    about.screenshots = screenshots
    about.releases = releases
    about.template = 'app/app'

    return res.render('base', about);
});

router.get(['/:id/download/:version/:type/:file', '/:id/download/:version/:type'], async function (req, res, next) {
    const version = req.params.version
    const appId = req.params.id
    const fileType = req.params.type

    var availableTypes = ['app', 'zip', 'dmg']

    // check if the type exists
    if (!availableTypes.includes(fileType)) {
        return res.redirect('/app/' + appId)
    }

    // find the app
    const app = await Application.findOne({
        'unique.appId': appId
    })

    // fallback
    var release = 'sorry, release not found'

    // find latest release
    if (version == 'latest') {
        release = await Release.find({
            '_id': app.meta.latestRelease,
            'app': appId
        }).sort({
            _id: -1
        })

        release = release[0]
    } else {
        release = await Release.find({
            '_id': version,
            'app': appId
        }).sort({
            _id: -1
        })

        release = release[0]
    }

    var downloadUrl = ''

    if (fileType == 'app') {
        downloadUrl = release.binaries.app
    } else if (fileType == 'zip') {
        downloadUrl = release.binaries.zip
    } else if (fileType == 'dmg') {
        downloadUrl = release.binaries.dmg
    }

    return res.redirect(downloadUrl)
});

module.exports = router;