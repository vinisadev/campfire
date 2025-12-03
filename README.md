<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->

[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]
[![LinkedIn][linkedin-shield]][linkedin-url]

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/vinisadev/campfire">
    🔥
  </a>

<h3 align="center">Campfire</h3>

  <p align="center">
    A lightweight, native desktop API client for testing and debugging REST APIs. Built with Go and React.
    <br />
    <a href="https://github.com/vinisadev/campfire"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/vinisadev/campfire">View Demo</a>
    &middot;
    <a href="https://github.com/vinisadev/campfire/issues/new?labels=bug&template=bug-report---.md">Report Bug</a>
    &middot;
    <a href="https://github.com/vinisadev/campfire/issues/new?labels=enhancement&template=feature-request---.md">Request Feature</a>
  </p>
</div>

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

[![Campfire Screen Shot][product-screenshot]](https://github.com/vinisadev/campfire)

Campfire is a fast, lightweight native desktop application for testing and debugging REST APIs. Unlike browser-based or Electron-wrapped alternatives, Campfire is built with Go and Wails, resulting in a snappy, resource-efficient experience.

**Key Features:**
- 🚀 **Native Performance** - Built with Go and compiled to native code
- 📁 **Collection Management** - Organize requests into collections with folders, saved as `.campfire` files
- 🔐 **Multiple Auth Types** - Support for Basic Auth, Bearer Token, and API Key authentication
- 📝 **Full Request Control** - Configure HTTP methods, headers, query parameters, and request body
- 📊 **Response Insights** - View response body, headers, status codes, timing, and size
- 🌙 **Dark Theme** - Easy on the eyes with a modern dark interface

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Go][Go]][Go-url]
- [![React][React.js]][React-url]
- [![Wails][Wails]][Wails-url]
- [![Vite][Vite]][Vite-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these steps.

### Prerequisites

- **Go 1.23+** - [Download Go](https://go.dev/dl/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Wails CLI** - Install with:
  ```sh
  go install github.com/wailsapp/wails/v2/cmd/wails@latest
  ```
- **Platform Dependencies** - See the [Wails installation guide](https://wails.io/docs/gettingstarted/installation) for your OS

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/vinisadev/campfire.git
   ```
2. Navigate to the project directory
   ```sh
   cd campfire
   ```
3. Install frontend dependencies
   ```sh
   cd frontend && npm install && cd ..
   ```
4. Run in development mode
   ```sh
   wails dev
   ```
5. Build for production
   ```sh
   wails build
   ```
   The compiled binary will be in the `build/bin/` directory.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

1. **Create a Collection** - Click "New Collection" in the sidebar to create a new collection file (`.campfire`)
2. **Add Requests** - Right-click on a collection or folder to add new requests or folders
3. **Configure Request** - Select an HTTP method (GET, POST, PUT, PATCH, DELETE), enter the URL, and configure:
   - **Params** - Add query parameters
   - **Headers** - Add custom HTTP headers
   - **Body** - Add request body (JSON, XML, etc.)
   - **Auth** - Configure authentication (Basic, Bearer, or API Key)
4. **Send Request** - Click "Send" to execute the request
5. **View Response** - Inspect the response body, headers, status code, response time, and size

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ROADMAP -->

## Roadmap

- [ ] Environment variables support
- [ ] Request history
- [ ] Import/Export collections (Postman, Insomnia formats)
- [ ] Code generation for multiple languages
- [ ] Pre-request and post-request scripts
- [ ] WebSocket support
- [ ] GraphQL support

See the [open issues](https://github.com/vinisadev/campfire/issues) for a full list of proposed features (and known issues).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Top contributors:

<a href="https://github.com/vinisadev/campfire/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=vinisadev/campfire" alt="contrib.rocks image" />
</a>

<!-- LICENSE -->

## License

Distributed under the MIT License. See `LICENSE` for more information.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Vincenzo Fehring - vinfehring@gmail.com

Project Link: [https://github.com/vinisadev/campfire](https://github.com/vinisadev/campfire)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- ACKNOWLEDGMENTS -->

## Acknowledgments

- [Wails](https://wails.io/) - The framework that makes native Go + web UI apps possible
- [React](https://reactjs.org/) - Frontend UI library
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [Best-README-Template](https://github.com/othneildrew/Best-README-Template) - README template

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/vinisadev/campfire.svg?style=for-the-badge
[contributors-url]: https://github.com/vinisadev/campfire/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/vinisadev/campfire.svg?style=for-the-badge
[forks-url]: https://github.com/vinisadev/campfire/network/members
[stars-shield]: https://img.shields.io/github/stars/vinisadev/campfire.svg?style=for-the-badge
[stars-url]: https://github.com/vinisadev/campfire/stargazers
[issues-shield]: https://img.shields.io/github/issues/vinisadev/campfire.svg?style=for-the-badge
[issues-url]: https://github.com/vinisadev/campfire/issues
[license-shield]: https://img.shields.io/github/license/vinisadev/campfire.svg?style=for-the-badge
[license-url]: https://github.com/vinisadev/campfire/blob/master/LICENSE
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/vinisadev
[product-screenshot]: images/Screenshot.png

[Go]: https://img.shields.io/badge/Go-00ADD8?style=for-the-badge&logo=go&logoColor=white
[Go-url]: https://go.dev/
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://reactjs.org/
[Wails]: https://img.shields.io/badge/Wails-DF0000?style=for-the-badge&logo=wails&logoColor=white
[Wails-url]: https://wails.io/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
