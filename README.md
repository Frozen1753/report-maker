Dans l'`index.ts` du dossier `report`, tu peux retrouver les chemins dynamiquement de TOUT les `.mdx`

Depuis l'ajout du DOM, on pèse légèrement plus de 100ko en + qu'avant.

Le composant page permet bien d'afficher le MD cependant il faudra changer le [script](build/shiki/plugin.ts) pour compiler TOUT les mdx au lieu du principal

Peut etre aussi faire un script pour auto générer le app en fonction de si le PAGES contient de choses, comme ca si non, on utilise pas le dom,

J'ai fais encore un autre sous dossier, a voir ce qu'on pourrait faire avec ou juste scrap parce que c'est juste un rapport et pas un mini wiki!
