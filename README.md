# Glosträning 📚

En liten webbsida för att öva veckans engelska glosor på ett roligt sätt.
Fungerar i mobilen och på datorn, kräver ingen inloggning och sparar framstegen (stjärnor
och egna meningar) i webbläsaren.

## Övningar

| Övning | Vad man gör |
|---|---|
| 🃏 Glosor | Vänd kort (svenska ⇄ engelska), hör uttalet, se exempelmening |
| ❓ Flerval | Välj rätt översättning bland fyra alternativ |
| 🧩 Para ihop | Matcha svenska och engelska ord mot klockan |
| ⌨️ Stava | Skriv det engelska ordet – med ledtrådar och uppläsning |
| 🕳️ Lucktext | Välj ordet som saknas i en mening |
| 🧱 Bygg meningen | Sätt ihop blandade ord till en mening |
| ✍️ Skriv meningar | Skriv egna meningar med orden – sajten kollar stor bokstav, punkt och att ordet finns med |

Varje övning ger 0–3 stjärnor. Engelska ord och meningar kan läsas upp (🔊).

## Lägga till nya glosor varje vecka

1. Öppna `add.html` på sajten (länken "Lägg till nya glosor" längst ner på startsidan).
2. Klistra in glosorna, en per rad: `svenska - engelska`.
   Exempelmeningar läggs till efter `|`, med [hakparenteser] runt ordet:
   `socker - sugar | Add two cups of [sugar]. | Too much [sugar] is bad for your teeth.`
3. Kopiera koden som skapas och klistra in den direkt efter `const WEEKS = [` i `data/words.js`.
4. Committa – klart!

Den senaste veckan (efter datum) visas överst som "Veckans glosor".

## Publicera med GitHub Pages

Settings → Pages → *Deploy from a branch* → välj branch och mappen `/ (root)` → Save.
Sajten hamnar på `https://<användarnamn>.github.io/homework/`.

## Köra lokalt

```sh
python3 -m http.server
# öppna http://localhost:8000
```
