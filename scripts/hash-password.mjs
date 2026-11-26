// Génère le hash bcrypt du mot de passe administrateur.
// Utilisation : pnpm hash:password
//
// Le mot de passe est saisi de façon masquée (deux fois). Le script affiche
// la ligne à coller dans .env.local (avec les « $ » échappés, sinon Next.js
// les remplace par une chaîne vide) et la valeur brute pour Vercel.
import bcrypt from "bcryptjs";

const MIN_LENGTH = 10;

function ask(question) {
  return new Promise((resolve) => {
    const { stdin, stdout } = process;
    stdout.write(question);
    if (!stdin.isTTY) {
      // Saisie non interactive (ex. : echo "mdp" | pnpm hash:password)
      let data = "";
      stdin.setEncoding("utf8");
      stdin.on("data", (c) => (data += c));
      stdin.on("end", () => resolve(data.split(/\r?\n/)[0]));
      return;
    }
    let value = "";
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding("utf8");
    const onData = (char) => {
      if (char === "\u0003") { // Ctrl+C
        stdout.write("\n");
        process.exit(1);
      }
      if (char === "\r" || char === "\n" || char === "\u0004") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(value);
        return;
      }
      if (char === "\u007f" || char === "\b") {
        if (value.length) {
          value = value.slice(0, -1);
          stdout.write("\b \b");
        }
        return;
      }
      value += char;
      stdout.write("*".repeat(char.length));
    };
    stdin.on("data", onData);
  });
}

const password = await ask("Mot de passe administrateur : ");
if (password.length < MIN_LENGTH) {
  console.error(`\n✗ Le mot de passe doit contenir au moins ${MIN_LENGTH} caractères.\n`);
  process.exit(1);
}
if (process.stdin.isTTY) {
  const confirm = await ask("Confirmez le mot de passe : ");
  if (confirm !== password) {
    console.error("\n✗ Les deux saisies ne correspondent pas.\n");
    process.exit(1);
  }
}

const hash = await bcrypt.hash(password, 12);
console.log("\n✓ Hash généré.\n");
console.log("À coller dans .env.local (les « $ » sont échappés) :\n");
console.log(`ADMIN_PASSWORD_HASH=${hash.replace(/\$/g, "\\$")}\n`);
console.log("Valeur brute (variables d'environnement Vercel) :\n");
console.log(`${hash}\n`);
