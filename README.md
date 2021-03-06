<p align="center">
    <img src="/public/img/logo/blue.svg" width="200px">

<h1 align="center">BetterMacStore</h1>
</p>

<p align="center">This is a Mac App Store on the web, created because I don't like the real one.</p>

# Table of Contents

<details>
<summary>Click me to view the TOC</summary>

* [Features](#features)
* [How it Works](#how-it-works)
    * [Translations](#translations)
* [Translating](#translating)
    * [Translating Apps](#translating-apps)
    * [Translating the Website](#translating-the-website)
* [Running Locally](#running-locally)
    * [Wasabi Setup](#wasabi-setup)
    * [Prerequisites](#prerequisites)
    * [Git Steps](#git-steps)
        * [First, Clone the Repo](#first-clone-the-repo)
        * [CD to the Dir](#cd-to-the-dir)
    * [NPM Steps](#npm-steps)
        * [Install Packages](#install-packages)
    * [ENV Steps](#env-steps)
        * [Renaming ENV](#renaming-env)
        * [Filling in the Data](#filling-in-the-data)
        * [Filling in the Wasabi Data](#filling-in-the-wasabi-data)
    * [More NPM Steps](#more-npm-steps)
    * [Making a User Admin](#making-a-user-admin)
* [Contributors](#contributors)
* [Contribute](#contribute)
* [File Structure](#file-structure)
    * [Routes](#routes)
    * [Config](#config)
    * [Modals](#modals)
* [Donate](#donate)
    * [Bitcoin](#bitcoin)
    * [Dogecoin](#dogecoin)
    * [Ethereum](#ethereum)
    * [Litecoin](#litecoin)
* [License](#license)
</details>

<img src="/public/img/divider.png" height="20px" width="100%">

# Features

* developer organizations
* release apps under personal accounts 
* release apps for organizations and personal accounts
* upload .app, .zip, and .dmg files
* upload .gif, .png, and .jpg files as app icons and screenshots
* for our electron developers, binary uploads up to 500 megabytes
* and soooo much more!

<img src="/public/img/divider.png" height="20px" width="100%">

# How it Works

### Translations
This will be displayed in the steps it takes for translations to work
* static translations are stored in the `./translations` folder
* a user translates by editing those files
* to add more strings to be translated, run the `translate` script
* __**compiling languages**__
* because some languages arent 100% translated, it took a lot of server time merging the English and other lanhguages file for each request
* we fixed this by "compiling" the languages
* the script `i18n_comp` compiles the languages into a folder called `./i18n_compiled`
* now, the server only has to access one translation file instead of going into two files and dynamically merging them
* __**how to compile languages**__
* you should never have to manually compile a langauge because the `start` script runs the `i18n_comp` script at the beginning
* i18n_comp folder is ignored because it is dynamic and changes

<img src="/public/img/divider.png" height="20px" width="100%">

# Translating

Hey! We appreciate translations sooo much! We want to bring forward an internet were no one is left behind, we can help start this by providing translations on the Better Mac Store!

If you translate anything, you can give yourself credit in the JavaScript file in a comment and/or below in the contributors section.

There are two ways you can help translate:
* by directly translating to the actual webiste (you will help contribute to this repo)
* by helping translate an app hosted on https://bettermacstore.com (you will need to contact the developers of other apps and translate)

### Translating Apps
You'll need to reach out to the app developer and ask them if you can translate, we don't have control over that part

### Translating the Website
First, define what language you'll want to translate English into. You can view needed translations by going [here](/translations) and finding a language file that hasnt been translated. (just open the file and you'll see if its been translated, but make sure you check everything because it might only be 50 or 75% translated)

Now, you can go in and translate the sentence on the left, and put the translated sentence into the quotes on the right! Once you have done this (you dont have to translate all of it, just as much as you can/want to), you can go ahead and open a pull request! We will approve and generally check the translations them merge it!

If there is a language you don't see in that folder, just open an issue and we'll take it from there. Or, you can do it yourslef:
* go and add a new file with the title being the language name in the `/translations` folder (make sure it ends in .js)
* then, go to `/views/partials/footer.ejs` and add a new select option to the dropdown (preferably in ABC order)

<img src="/public/img/divider.png" height="20px" width="100%">

# Running Locally
These instructions will be for macOS/Linux systems. Other instructions might be available in the wiki. If they aren't feel free to contribute to the wiki.

## Wasabi Setup
- create a wasabi account @ https://wasabi.com
- set up billing for public access to files
- create access keys and fill them in in the `.env`
- create a unique bucket name, I suggest also adding some random characters at the end so as not to mess with other buckets with similar names
- go into your bucket settings and press "POLICIES"
- paste this into the input, and change `YOUR_BUCKET` with your bucket name: 
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowPublicRead",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::YOUR_BUCKET/*"
    }
  ]
}
```

## Prerequisites
You will need `MongoDB`, available [here](https://mongodb.com) (you can install through Brew and Apt-Get). <br>
You will need `Node.JS`, available [here](https://nodejs.org). 

## Git Steps
### First, Clone the Repo
`git clone https://github.com/alechash/BetterMacStore`

### CD to The Dir
`cd BetterMacStore`

## NPM Steps
### Install Packages
`npm install`

## ENV Steps
### Renaming ENV
Find the file named `.env.example`, then rename that file to `.env`

### Filling in the Data
Because you are running the website locally, you can leave the `MONGO` entry alone<br>
`ENV` will need to be changed to `d` because we are in the development mode, if you were to actually deploy the website, you'd want this to be `p`<br>
`NAME` is what will show up on the website, this can be whatever you want<br>
`SECRET` is the encryption key for sessions, this can be whatever you want<br>
`ANALYTICS` is a boolean (true, or false) of whether to load Google Analytics onto the site<br>
if `ANALYTICS` was set to true, you need to provide a GA tracking code (available from analytics.google.com)<br>


### Filling in the Wasabi Data
Wasabi is the provider who stores the files (dmg, app, zip, png, jpg, and gif files)<br>
You'll need to signup at https://wasabi.com<br>
When you create an account, you'll need to create access keys<br>

`WASABI_API_KEY`, you can press "Access Keys" from the dashboard and generate a new API Key<br>
`WASABI_SECRET_KEY`, you will also get a "Secret Key", copy that and input it into the entry<br>
`WASABI_BUCKET_NAME`, is up to you, it is basically what folder your data will be stored in

## More NPM Steps
Now you can run `npm start` in your terminal, now navigate to http://localhost:3000 in your browser<br>

## Making a User Admin
Once you create an account, you can access the database using a tool like [Robo 3T](https://robomongo.org) to access the database and find that account. Then you can right-click and edit entry then change `"admin": false` to `"admin": true`

<img src="/public/img/divider.png" height="20px" width="100%">

# Contributors
You can view all contributors [here](https://github.com/alechash/BetterMacStore/graphs/contributors).

# Contribute
Pull requests and issues are welcome :)

<img src="/public/img/divider.png" height="20px" width="100%">

# File Structure
All the files are structured in an easy to use manner.

### Routes
All routes are available in the `./routes` folder

### Config
Config files are files with exports, like passport and functions

All config files are available in the `./config` folder

### Models
All database model files are available in the `./models` folder

### Scripts and Tests
All scripts and tests are available in the `./.scripts` folder<br>
Inside this folder is scripts like `translate.js` and then there are tests in the `./.scripts/.tests` folder<br>
In the tests folder is files like EJS linting

<img src="/public/img/divider.png" height="20px" width="100%">

# Donate

If you want to support the project, not just the continual coding of the site, but also the upkeep of the actual website (database, hosting, file store, and domain) then you can donate using crypto. If you are a company and would like advertising for a donation, please first email me personally, [jude@alecw.net](mailto:jude@alecw.net).

If you can't donate, I appreciate you even taking a look at the project (it really does mean a lot).

### Bitcoin
`bc1qjfe239yrr0qprg8tz8gtzsvxujk0pp465y4u4y`

### Dogecoin
much wow: `DQ5xZ9Wg5UpyamsciRkggoHc4bVUzUuW9s`

### Ethereum
`0x439FC978639D9b0d1b11b869b92889cD004E0fA2`

### Litecoin
`ltc1qglc620uem04l6xjkjr3ncften3dleqhd757e08`

<img src="/public/img/divider.png" height="20px" width="100%">

# License

This project is 100% maintained under the `MIT License`, please [view the license](/LICENSE).