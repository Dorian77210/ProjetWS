document.addEventListener("DOMContentLoaded", () => {
    const $content = document.getElementById("content");
    const $spinner = document.getElementById("spinner");

    // loadFilmByGenre();
    const homePage = document.getElementById("home-page");

    homePageDisplay();

    homePage.addEventListener("click", homePageDisplay);

    homePage.addEventListener("click", async event => {

        const mostPopular = new QueryBuilder();

        var matchingResults = {};

        // films les plus populaires
        mostPopular.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .selectDistinct("name", "wikiID", "gross")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:gross ?gross;")
            .andWhere("dbo:wikiPageID ?wikiID")
            .filter(`regex(lcase(str(?name)) ,lcase(".*avat.*"))`)
            .filter(`langMatches(lang(?name), "en")`);
        
        const latest = new QueryBuilder();
        
        // films les plus récents
        latest.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .selectDistinct("name", "wikiID", "what")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID;")
            .andWhere("<http://purl.org/dc/terms/subject> ?what")
            .filter(`regex(lcase(str(?what)) ,lcase(".*Category:[1-2][0-9][0-9][0-9]_films.*"))`)
            .filter(`regex(lcase(str(?name)) ,lcase(".*avat.*"))`)
            .filter(`langMatches(lang(?name), "en")`)
            .orderBy(`DESC(str(?what))`);
        

        try
        {
            $content.innerHTML = "";
            $spinner.style.display = "block";
            var result = await mostPopular.request();
            matchingResults.mostPopular = result.data.results.bindings;
            sortMoviesByGross(matchingResults.mostPopular);

            result = await latest.request();
            matchingResults.latest = result.data.results.bindings;
            $content.appendChild(await createFilmContainer(`Films les plus populaires`, matchingResults.mostPopular));
            $content.appendChild(await createFilmContainer(`Les derniers films`, matchingResults.latest));
            $spinner.style.display = "none";
            
        } catch(err)
        {
            console.log(err);
        }

    });

    const searchByText = document.getElementById("search-by-text");
    searchByText.addEventListener("click", async event => {
        const text = document.getElementById("filter-by-text").value.trim();

        if (text === "") return;
        const byFilm = new QueryBuilder();

        var matchingResults = {};

        // films matchant avec le texte
        byFilm.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .selectDistinct("name", "wikiID")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID")
            .filter(`regex(lcase(str(?name)) ,lcase(".*${text}.*"))`)
            .filter(`langMatches(lang(?name), "en")`);

        console.log(byFilm.__toString())
        
        const byActor = new QueryBuilder();

        // films par le nom des acteurs
        byActor.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .selectDistinct("name", "wikiID")
            .where("?film a dbo:Film;")
            .andWhere("dbp:starring ?actors;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID")
            .filter(`regex(lcase(str(?actors)) ,lcase(".*${text}.*"))`)
            .filter(`langMatches(lang(?name), "en")`);

        const byDirector = new QueryBuilder();

        // films par le nom du réalisateur
        byDirector.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .selectDistinct("name", "wikiID")
            .where("?film a dbo:Film;")
            .andWhere("dbo:director ?director;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID")
            .filter(`regex(lcase(str(?director)) ,lcase(".*${text}.*"))`)
            .filter(`langMatches(lang(?name), "en")`);

        try
        {
            $content.innerHTML = "";
            $spinner.style.display = "block";
            var result = await byFilm.request();
            matchingResults.byFilm = result.data.results.bindings;
            
            result = await byActor.request();
            matchingResults.byActor = result.data.results.bindings;

            result = await byDirector.request();
            matchingResults.byDirector = result.data.results.bindings;

            $spinner.style.display = "none";
            $content.appendChild(await createFilmContainer(`Films contenant "${text}"`, matchingResults.byFilm));
            $content.appendChild(await createFilmContainer(`Films dont le nom d'un acteur contient "${text}"`, matchingResults.byActor));
            $content.appendChild(await createFilmContainer(`Films dont le nom du directeur contient "${text}"`, matchingResults.byDirector));
            
        } catch(err)
        {
            console.log(err);
        }

    });
});

const homePageDisplay = async () => {
    const $content = document.getElementById("content");
    const $spinner = document.getElementById("spinner");

    const homePage = document.getElementById("home-page");
    const mostPopular = new QueryBuilder();

    var matchingResults = {};

    // films les plus populaires
    mostPopular.addPrefix("dbr", "<http://dbpedia.org/resource/>")
        .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
        .addPrefix("dbp", "<http://dbpedia.org/property/>")
        .selectDistinct("name", "wikiID", "gross")
        .where("?film a dbo:Film;")
        .andWhere("dbp:name ?name;")
        .andWhere("dbo:gross ?gross;")
        .andWhere("dbo:wikiPageID ?wikiID")
        .filter(`langMatches(lang(?name), "en")`);
    
    const latest = new QueryBuilder();
    
    // films les plus récents
    //TODO: investigate on distinct not working
    latest.addPrefix("dbr", "<http://dbpedia.org/resource/>")
        .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
        .addPrefix("dbp", "<http://dbpedia.org/property/>")
        .selectDistinct("name", "wikiID", "what")
        .where("?film a dbo:Film;")
        .andWhere("dbp:name ?name;")
        .andWhere("dbo:wikiPageID ?wikiID;")
        .andWhere("<http://purl.org/dc/terms/subject> ?what")
        .filter(`regex(lcase(str(?what)) ,lcase(".*Category:[1-2][0-9][0-9][0-9]_films.*"))`)
        .filter(`regex(lcase(str(?name)) ,lcase(".*avat.*"))`)
        .filter(`langMatches(lang(?name), "en")`)
        .orderBy(`DESC(str(?what))`);
    

    try
    {
        $content.innerHTML = "";
        $spinner.style.display = "block";
        var result = await mostPopular.request();
        matchingResults.mostPopular = result.data.results.bindings;
        sortMoviesByGross(matchingResults.mostPopular);

        result = await latest.request();
        matchingResults.latest = result.data.results.bindings;
        $content.appendChild(await createFilmContainer(`Films les plus populaires`, matchingResults.mostPopular));
        $content.appendChild(await createFilmContainer(`Les derniers films`, matchingResults.latest));
        $spinner.style.display = "none";
        
    } catch(err)
    {
        console.log(err);
    }
}

const sortMoviesByGross = (moviesList) => {
    moviesList.forEach( movie => {
        eIndex = movie.gross.value.indexOf('E');
        if (eIndex != "-1"){
            basicValue = parseFloat(movie.gross.value.substr(0, eIndex));
            powerOfTen = parseInt(movie.gross.value.substr(eIndex+1));
            numericGrossValue = basicValue * Math.pow(10, powerOfTen);
            movie.gross.value = numericGrossValue;
        }
        else{
            movie.gross.value = parseFloat(movie.gross.value);
        }
    })

    moviesList.sort(function(a, b) { 
        return b.gross.value - a.gross.value;
    })
}

const toggleDiv = div => {
    if (div.classList.contains("close"))
    {
        div.classList.remove("close");
        div.classList.add("open");
    }
    else
    {
        div.classList.remove("open");
        div.classList.add("close");
    }
}

const createFilmContainer = async (title, films) => {
    // on affiche les films
    var $filmContent = document.createElement("div");

    var $title = document.createElement("h3");

    $title.classList.add("main-title");
    $title.textContent = `${title}`;

    $filmContent.appendChild($title);

    var $filmContainer = document.createElement("div");
    $filmContainer.classList.add("filmContainer");
    $filmContainer.classList.add("open");

    $title.onclick = () => toggleDiv($filmContainer);
    
    const screenWidth = window.screen.width;
    for (const film of films){
        const $film = document.createElement("div");
        $film.classList.add("film");

        const $img = document.createElement("img");

        var $filmName = document.createElement("h5");
        $filmName.classList.add("filmName");
        $filmName.textContent = film.name.value;
        var imageURL = await getImageURL(film.wikiID.value);
        if (imageURL === "")
        {
            imageURL = "./../img/no-poster-available.png";
        }

        $img.setAttribute("src", imageURL);
        $img.classList.add("film-img");

        $film.appendChild($filmName);
        $film.appendChild($img);

        $filmContainer.appendChild($film);
    };

    $filmContent.appendChild($filmContainer);

    return $filmContent;
}

async function loadFilmByGenre() {

    var genres = ["Romance films", "Historical films", "Horror films", "Action films", "Adventure films", "Sports films", "Documentary films", "Thriller films", "Science fiction films"]
    var matchingResults = {};

    var filter = "";

    
    for(var i=0;i<genres.length; i++) {
        filter = filter + `contains(lcase(str(?genreName)) ,lcase(${genre}))`;
        if(i < genres.length - 1)
            filter = filter + ' || ';
    }
        const builder = new QueryBuilder();

        // films par le nom des acteurs
        builder.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .addPrefix("dct", "<http://purl.org/dc/terms/>")
            .addPrefix("skos", "<http://www.w3.org/2004/02/skos/core#>")
            .selectDistinct("name", "wikiID", "genre")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID;")
            .andWhere("dct:subject ?genreLink.")
            .andWhere("?genreLink rdfs:label ?genreName")
            .filter(filter)
            .filter(`langMatches(lang(?name), "en")`)

        console.log(builder.__toString());

        try
        {
            console.log("bite");
            var result = await builder.request();
            matchingResults[genre] = result.data.results.bindings;
            
            console.log("penis");
            console.log(matchingResults);
            
        } catch(err)
        {
            console.log(err);
        }
    
}