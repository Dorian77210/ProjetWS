const genres = ["Romance films", "Historical films", "Horror films", "Action films", "Adventure films", "Sports films", "Documentary films", "Thriller films", "Science fiction films"]

document.addEventListener("DOMContentLoaded", () => {
    const $content = document.getElementById("content");
    const $spinner = document.getElementById("spinner");
    const $genreSelect = document.getElementById("genres");
    
    // Création des genres
    genres.forEach(genre => {
        const $option = document.createElement("option");
        $option.setAttribute("value", genre);
        $option.textContent = genre;

        $genreSelect.appendChild($option);
    });

    $genreSelect.onchange = (event) => loadFilmByGenre(event);

    homePageDisplay();
    loadFilmByGenre();

    const homePage = document.getElementById("home-page");

    homePage.addEventListener("click", homePageDisplay);
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
            .selectDistinct("name", "wikiID", "gross")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID")
            .optional("?film dbo:gross ?gross")
            .filter(`regex(lcase(str(?name)) ,lcase(".*${text}.*"))`)
            .filter(`langMatches(lang(?name), "en")`)
            .orderBy("DESC(str(?gross))");

            console.log(byFilm.__toString());
        
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
            .optional("?film dbo:gross ?gross")
            .filter(`regex(lcase(str(?actors)) ,lcase(".*${text}.*"))`)
            .filter(`langMatches(lang(?name), "en")`)
            .orderBy("DESC(str(?gross))");

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
            .optional("?film dbo:gross ?gross")
            .filter(`regex(lcase(str(?director)) ,lcase(".*${text}.*"))`)
            .filter(`langMatches(lang(?name), "en")`)
            .orderBy("DESC(str(?gross))");

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

document.addEventListener( "click", someListener );

function someListener(event){
    var element = event.target;
    if(element.classList.contains("film")){
        var wikiId = element.getAttribute("wikiid");
    }
    if(element.parentNode.classList.contains("film")){
        var wikiId = element.parentNode.getAttribute("wikiid");
    }
    console.log(wikiId); 
    if (wikiId) {
        window.location = './filmDetail.html?wikiId=' + wikiId;
    }
}

const homePageDisplay = async () => {
    const $content = document.getElementById("content");
    const $spinner = document.getElementById("spinner");

    const mostPopular = new QueryBuilder();

    var matchingResults = {};

    // films les plus populaires
    // TODO: verifier la coherence des gross
    mostPopular.addPrefix("dbr", "<http://dbpedia.org/resource/>")
        .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
        .addPrefix("dbp", "<http://dbpedia.org/property/>")
        .selectDistinct("name", "wikiID", "gross")
        .where("?film a dbo:Film;")
        .andWhere("dbp:name ?name;")
        .andWhere("dbo:gross ?gross;")
        .andWhere("dbo:wikiPageID ?wikiID")
        .filter(`langMatches(lang(?name), "en")`)
        .filter(`regex(lcase(str(?gross)) ,lcase(".*E(12|11|10|9).*"))`)
    
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
        .filter(`langMatches(lang(?name), "en")`)
        .orderBy(`DESC(str(?what))`)
        .limit(10);
    
    try
    {
        $content.innerHTML = "";
        $spinner.style.display = "block";
        var result = await mostPopular.request();
        matchingResults.mostPopular = result.data.results.bindings;
        sortMoviesByGross(matchingResults.mostPopular);

        console.log(matchingResults.mostPopular);

        result = await latest.request();

        
        matchingResults.latest = result.data.results.bindings;
        console.log(matchingResults.latest);
        $content.appendChild(await createFilmContainer(`Films les plus populaires`, matchingResults.mostPopular.slice(0, 10)));
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
    const $spinner = document.getElementById("spinner");

    var $filmContent = document.createElement("div");
    var $title = document.createElement("h3");

    $title.classList.add("main-title");
    $title.textContent = `${title}`;

    $filmContent.appendChild($title);

    var $filmContainer = document.createElement("div");
    $filmContainer.classList.add("filmContainer");
    $filmContainer.classList.add("open");

    $title.onclick = () => toggleDiv($filmContainer);
    
    $spinner.style.display = "block";
    for (const film of films){
        const $film = document.createElement("div");
        $film.classList.add("film");
        $film.setAttribute('wikiId', film.wikiID.value);

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

    $spinner.style.display = "none";

    $filmContent.appendChild($filmContainer);

    return $filmContent;
}

async function loadFilmByGenre(event)
{
    if (event)
    {
        const option = event.target;
        const genre = option.value;
        const $spinner = document.getElementById("spinner");
        const $content = document.getElementById("content");

        if (genre === "none") return;

        const builder = new QueryBuilder();
        builder.addPrefix("dbr", "<http://dbpedia.org/resource/>")
            .addPrefix("dbo", "<http://dbpedia.org/ontology/>")
            .addPrefix("dbp", "<http://dbpedia.org/property/>")
            .addPrefix("dct", "<http://purl.org/dc/terms/>")
            .addPrefix("skos", "<http://www.w3.org/2004/02/skos/core#>")
            .selectDistinct("name", "wikiID")
            .where("?film a dbo:Film;")
            .andWhere("dbp:name ?name;")
            .andWhere("dbo:wikiPageID ?wikiID;")
            .andWhere("dct:subject ?genreLink.")
            .andWhere("?genreLink rdfs:label ?genreName")
            .filter(`langMatches(lang(?name), "en")`)
            .filter(`(contains(lcase(str(?genreName)) ,lcase("${genre}")))`)
            .limit(50);

        try
        {
            $spinner.style.display = "block";
            var result = await builder.request();
            const films = result.data.results.bindings;
            $spinner.style.display = "none";
            
            $content.innerHTML = "";
            $content.appendChild(await createFilmContainer(`Films avec le genre "${genre}"`, films));
        } catch(err)
        {
            console.log(err);
        }
    }
}
