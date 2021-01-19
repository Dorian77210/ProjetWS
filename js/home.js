document.addEventListener("DOMContentLoaded", () => {
    const $content = document.getElementById("content");
    const $spinner = document.getElementById("spinner");


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
            .orderBy("DESC", "gross");

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
            $content.appendChild(createFilmContainer(`Films contenant "${text}"`, matchingResults.byFilm));
            $content.appendChild(createFilmContainer(`Films dont le nom d'un acteur contient "${text}"`, matchingResults.byActor));
            $content.appendChild(createFilmContainer(`Films dont le nom du directeur contient "${text}"`, matchingResults.byDirector));
            
        } catch(err)
        {
            console.log(err);
        }

    });
});

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

const createFilmContainer = (title, films) => {
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
    
    films.forEach(async film => {
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
    });

    $filmContent.appendChild($filmContainer);

    return $filmContent;
}