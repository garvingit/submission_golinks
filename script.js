let submitBtn = document.getElementById("submit");
submitBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    let includeForked = document.getElementById("fork").checked;
    let username = document.getElementById("username").value;
    let response = await requestRepoInfo(username, includeForked);
    document.getElementById("h3").innerText = "Result:"
    document.getElementById("jsontag").innerText = JSON.stringify(response,null,'\t');
})

async function requestRepoInfo(username, forked){
    return new Promise( (resolve, reject) => {
        // Create new XMLHttpRequest object, to make request to github API
        const xhr = new XMLHttpRequest();
        
        // GitHub endpoint, pass in specified user, and the number of repos per page
        const url = `https://api.github.com/users/${username}/repos?per_page=100`;
        let result = []
        let totalCount;
        let totalStargazers = 0;
        let totalForkCount = 0;
        let averageSize;
        let languages;

        // Open a new connection, using a GET request via URL endpoint
        // Providing 3 arguments (GET/POST, The URL, Async True/False)
        xhr.open('GET', url, true);
        // When request is received
        // Process it here
        xhr.onload = function() {
            
            // Parse API data into JSON
            let data = JSON.parse(this.response);
            let newData = [];

            //only show repos that are not forked
            if (forked == false || forked == "false") {
                data.forEach((element) => {
                    if (element.fork == false) {
                        newData.push(element);
                    }
                });
                data = newData;
            }

            let totalRepoSize = 0;
            //total count of all repos
            totalCount = data.length;

            //adding up stargazers and fork count
            data.forEach(element => {
                totalStargazers += element.stargazers_count;
                totalForkCount += element.forks_count;
                totalRepoSize += element.size;
            });
            //average size
            averageSize = getAverageSize(totalRepoSize, totalCount);

            //list of languages
            languages = getListOfLanguages(data);

            result = {
                "total_repo_count": totalCount,
                "total_stargazers": totalStargazers,
                "total_fork_count": totalForkCount,
                "average_repo_size": averageSize,
                "list_of_languages": languages
            };
            resolve(result);
        }
        // Send the request to the server
        xhr.send();
        
    });

}

function getAverageSize(size, length) {
    //average rounded to nearest tenths
    let average = Math.round(10*(size / length))/10;
    let averageSize;
    //convert to gb
    if (average > 1000) {
        average = average / 1000;
        average = Math.round(10*average)/10;
        averageSize = `${average} GB`

    //convert to kb
    } else if (average < 0) {
        average = average * 1000;
        averageSize = `${average} KB`
    } else {
        averageSize = `${average} MB`
    }

    return averageSize;
}

function getListOfLanguages(repos) {
    let languages = {};
    repos.forEach((repo) => {
        let language = repo.language;

        //getting rid of null langauges
        if (language != null) {
            if (!(language in languages)) {
                languages[language] = 1;
            } else {
                languages[language]++;
            }
        }
    });

    //sorting them
    let languageList = Object.keys(languages).map((key) => {
        return [key, languages[key]];
    });
    languageList.sort(function (first, second) {
        return second[1] - first[1];
    });

    return languageList;
}
