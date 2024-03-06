import os
import re

def listhtmls():
    """Lister tous les fichiers html du projet
       (sauf les templates footer et nav)."""
    L = []
    for dname, dirs, files in os.walk(".."):
        for fname in files:
            if fname.split('.')[-1] == "html" and fname not in ["footer.html", "nav.html"]:
                L.append(os.path.join(dname, fname))
    return L

htmls = listhtmls()
print(htmls)


# https://stackoverflow.com/a/4205918/23503309
def rep_str(repi, repo):
    """Modifier les instances de repi par repo, dans tous les fichiers html."""
    for fpath in htmls:
        with open(fpath) as f:
            s = f.read()
        s = s.replace(repi, repo)
        with open(fpath, "w") as f:
            f.write(s)

def r():
    """Retirer les commentaires inutiles du tutoriel."""
    repi = """
            <!-- Ceci est un commentaire -->"""
    repo = ""
    rep_str(repi, repo)

    repi = """
                <!-- Placez ici le contenu du pied de page -->"""
    repo = ""
    rep_str(repi, repo)

    repi = """
            <!-- Placez ici le contenu de l'en-tête de votre page -->"""
    repo = ""
    rep_str(repi, repo)
r()


def rep_footer():
    """Mettre à jour tous les footers."""
    newfooter = open("footer.html").read()
    for fpath in htmls:
        print(fpath)
        with open(fpath) as f:
            s = f.read()
        try:
            deb = s.index("<footer>")
            fin = s.index("</footer>")
            oldfooter = s[deb-8:fin+9]
            s = s.replace(oldfooter, newfooter)
            with open(fpath, "w") as f:
                f.write(s)
        except:
            print(" PAS TROUVÉ")

# rep_footer()


def rep_nav():
    """Mettre à jour toutes les navbars."""
    dict = {"a-propos": "à propos de jej",
            "galerie": "galerie jej",
            "dessins": "dessins",
            "videos": "vidéos",
            "images": "images",
            "textes": "textes",
            "jeux": "jeux",
            "remerciements": "special thanks"}
    newnav = open("nav.html").read()

    for fpath in htmls:
        with open(fpath) as f:
            s = f.read()
            deb = s.index("<nav>")
            fin = s.index("</nav>")
            oldnav = s[deb-8:fin+6] # on récupère son ancienne <nav>
        name = fpath.split("\\")[-1][:-5]
        print(fpath, name)

        if name in dict.keys(): # si c'est un des onglets principaux
            print('^^^^')
            newnavlines = newnav.split('\n')
            for i in range(len(newnavlines)): # on modifie le template
                if name in newnavlines[i]:
                    oldline = re.findall("<span>.*</span>", newnavlines[i])[0]
                    newline = f'<span class="active">{dict[name]}</span>'
                    newnavlines[i] = newnavlines[i].replace(oldline, newline)
                    break # pour que l'onglet actif soit noté différent dans la barre
            newnave = '\n'.join(newnavlines)
            print(newnave)

        elif len(fpath.split("\\")) == 3: # si c'est dans un sous-dossier
            newnave = newnav.replace('href="', 'href="../')
            print(newnave)

        else:
            newnave = newnav

        s = s.replace(oldnav, newnave) # on remplace le nav
        with open(fpath, "w") as f:
            f.write(s) # et on l'écrit dans le fichier
rep_nav()