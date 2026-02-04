# Quiz Funnel

## How to Edit Text Content

All text in the quiz can be edited directly on GitHub. The content is stored in JSON files in the `content/` folder.

### Content Files

| File | What it controls |
|------|------------------|
| `content/quiz.json` | Quiz questions, options, and name input screen |
| `content/results.json` | Results page text, insights, and labels |
| `content/learning-path.json` | Sales page text, pricing, testimonials |
| `content/common.json` | Error messages and loading text |

### How to Edit

1. Go to your GitHub repository
2. Click the `content/` folder
3. Click the JSON file you want to edit
4. Click the pencil icon (Edit this file)
5. Change the text between the `"quotes"`
6. Scroll down and click **Commit changes**
7. The site updates automatically in 1-2 minutes

### Important Rules

- Only change text inside `"quotes"`
- Don't remove commas, colons, or brackets
- Use `{name}` where you want the user's name to appear
- Don't change the keys (text before the colon)

### Example

```json
{
  "heading": "Welcome to the Quiz",
  "button": "Get Started"
}
```

To change the button text, edit `"Get Started"` to your new text:

```json
{
  "heading": "Welcome to the Quiz",
  "button": "Begin Now"
}
```

---

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)
