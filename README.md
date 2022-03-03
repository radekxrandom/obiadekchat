#### [Unmaintained, som issues don't work. It's here for nostalgic reasons only]


<h1 align="center">Obiadekchat - https://obiadekchat.now.sh/</h1>

> Built with MERN stack (MongoDB, Express, React and Node) and socket.io.
> End to end RSA encrypted web chat single page application.
> User's have intuitive ways to customize their profiles and they can easily adjust security options in settings.

### <h2 align="center"> ⚡️⚡️⚡️ &nbsp; [Obiadekchat](https://obiadekchat.now.sh/) ⚡️⚡️⚡️ </h2>

![sc](https://i.imgur.com/RySua5H.png)

## 📜 &nbsp; Table of contents

- [Main Features](#--main-features)
- [Technologies](#--technologies)
- [Future goals](#--future-goals)
- [Setup](#--setup)

## 🚩 &nbsp; Main Features

> This website enables users to message their friends without the need to provide any personal data.
> Messages are end-to-end RSA encrypted and by default are deleted 5 minutes after being viewed by the receiving user.

#### User profile

- **Registration and authentication**
  - User account is generated when the new user visit the website for a first time.
  - Because of this fact, customizing it is intuitive and easily accessible.
- **User settings and profile customization**
  - Users can switch to dark theme ![Picture](https://i.imgur.com/K813ckx.png)
  - Changing username is as easy as hovering over it and typing a new one ![Picture](https://i.imgur.com/1Lbl5uq.png)
  - Profile picture can be changed easily too ![Picture](https://i.imgur.com/su1IU6F.png)
  - There are also settings that allow users to adjust security to their needs
    ![Picture](https://i.imgur.com/N7lEwvj.png)

#### Contacts network management

- **There are real time notifications about user's contacts**

![Starting page](https://i.imgur.com/vCqOH42.png)

- **Adding new contacts with a Search ID**
  - Each user has a special Search ID which can be used by others to look up his profile. ![Search ID with alert saying it was copied](https://i.imgur.com/0H3YLEr.png)
  - To copy it users can click it or the icon next to it. Navigation with tab works too.
  - After finding someone's profile a friend request can be send.
  - This request can be either accepted or declined.
- **Adding new contacts with a URL**
  - Users can also add contacts by sharing a specially generated URL with them.
  - Each URL can be used only once.
  - It can be shared with friends who already use the website or with completely new users.
    ![sc](https://i.imgur.com/kADzOac.png)
- **Removing contacts**
  - Deleting contacts requires only two click of the mouse.
    ![sc](https://i.imgur.com/1jRNADl.png)
    ![sc](https://i.imgur.com/vZMBPPm.png)

#### Responsive design

- **Especially for a chat application it is very important to look (and work) good on mobile devices. Please see for yourself using developer's tools in your browser**

![sc](https://i.imgur.com/aPj4XQo.png)
![sc](https://i.imgur.com/5yYUCt0.png)
![sc](https://i.imgur.com/ftcpkoI.png)
![sc](https://i.imgur.com/X4f7gIO.png)

## 💹 &nbsp; Technologies

> Project is created with:

#### Server

- Express
- Mongoose
- JWT Tokens for authentication
- bcryptjs for one way password hashing
- socket.io for real-time, bidirectional, event based communication between client and server. Oh and also for having a level of abstraction over managing WebSockets, long polling, etc.
- mocha

#### Client

- React JS
- Redux (although I am moving away from it)
- Redux Thunk
- Axios
- rsuite (although I am moving away from it because of bad a11y support)
- Hybrid Crypto JS
- WDYR for help with optimization in development mode

## 💡 &nbsp; Future goals

- Full a11y compliance. As of now only the Starting page is easily navigated with keyboard and has 100% correct aria labels.
- Polish localization.
- Being able to use one account on different devices.
- Better test coverage.
- Cleaner and faster code.
- Many, many other things.

## 💻 &nbsp; Setup

To run this project, install it locally using npm:

```
$ git clone https://github.com/radekxrandom/obiadekchat.git
```

Backend

```
$ cd obiadekchat/back
$ yarn install (install backend dependencies)
$ yarn run devstart (use nodemon to auto reload on changes)
```

Frontend

```
$ cd obiadekchat/front
$ yarn install (install frontend dependencies)
$ yarn start
```

Remember to create .env file and populate it with constants needed for the application to work.
