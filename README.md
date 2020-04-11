# Repository-Investigator

A local application that allows you to investigate and visualize your repository following principles described in [Your Code as a Crime Scene](https://www.amazon.com/Your-Code-Crime-Scene-Bottlenecks/dp/1680500384). 

<img width="819" alt="Screen Shot 2020-04-11 at 11 06 10 PM" src="https://user-images.githubusercontent.com/16775806/79050348-98729f80-7c53-11ea-9a08-29e19a418551.png">


The Heatmap of your repository allows you to see the complexity, where complexity is defined as a combination of lines of code and the frequency of change. 

The bigger and darker a file is, the more complex it is. You can identify the most complex files and use them as entry points when understanding a new code base because these they represent the big things that have been worked on the most recently.

Alternatively, you can also see them as candidates for code refactoring or obscure bug originators.

## Stack
D3 js + hyperapp + express + mocha.

## Features: 
- [X] Heat map of the repository based on file's lines of code and number of revisions.
- [X] Display number of revisions, path to file of a particular item.
- [X] Control the heatmap (zoom, highlight) for a particular item.
- [X] Display top n-revisited files with configurable parameter **n**.
- [ ] More forensic traits.
- [ ] More visualizations.

## Demo

![demo2](https://user-images.githubusercontent.com/16775806/79049411-bccb7d80-7c4d-11ea-9575-6805778b8269.gif)


## Installation
### Prerequisite
- Java 8
- NodeJS
- Vscode
- [Code Maat](https://github.com/adamtornhill/code-maat)
- [Cloc](https://github.com/AlDanial/cloc#install-via-package-manager)

### Usage
Start client:
```
npm start
```
Start server:
```
node server.js
```

### Feature
- **Alt + Click**: Display the top n-revisited items of the selected item. Different regions result in different item.
- **Shift + Click**: Dispay the details of the selected item.
