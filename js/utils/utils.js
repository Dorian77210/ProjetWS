const DBPEDIA_URL = "http://dbpedia.org/sparql";

class QueryBuilder
{
    constructor()
    {
        this.prefix = "";
        this.whereBody = "";
        this.selectBody = "";
        this.filterBody = "";
    }

    /**
     * Permet de sélectionner des attributs dans un requête. 
     * Exemple : queryBuilder.select("nom", "prenom")
     * @param {Array} params Les paramètres à sélectionner 
     * @return L'objet courant
     */
    select(...params)
    {
        for (const param of params)
        {
            this.selectBody += (param !== "*")
                ? `?${param}`
                : "*";


            return this;
        }
    }

    /**
     * Permet d'ajouter une condition Where
     * @param {String} content Le contenu de la clause WHERE
     * @return L'objet courant
     */
    where(content)
    {
        this.whereBody = content;
        return this;
    }

    /**
     * Rajoute une condition dans la clause WHERE
     * @param {String} content Le contenu à ajouter
     * @return L'objet courant 
     */
    andWhere(content)
    {
        this.whereBody += " " + content;
        return this;
    }

    filter(f)
    {
        this.filterBody += f + "\n";
    }

    /**
     * Permet d'ajouter un préfixe dans la requête
     * @param {String} alias L'alias du préfixe 
     * @param {String} uri L'URI
     * @return L'objet courant 
     */
    addPrefix(alias, uri)
    {
        this.prefix += `PREFIX ${alias}: ${uri} \n`;
        return this;
    }

    __toString()
    {
        var res = `${this.prefix} SELECT ${this.selectBody} WHERE { ${this.whereBody} `;
        if (this.filterBody !== "")
        {
            res = `${res} FILTER ${this.filterBody}`;
        }
        res += "}";
        
        return res;
    }

    request()
    {
        const query = this.__toString();
        const url = DBPEDIA_URL + "?query=" + encodeURIComponent(query) +"&format=json";
        return axios.get(url);
    }
}