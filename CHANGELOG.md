# Changelog

Trinity Teaching: chapter presentations for every classroom board, with AI study support.
Android and Windows apps update themselves through **Check for updates**; an APK is only reinstalled when noted.

## 1.8.0 (9 November 2026)
No reinstall: arrives through **Check for updates**. The AI server fixes apply to every board straight away.
- **AI Quiz loads reliably.** Quizzes of 10 or more questions always failed with "The free AI models are busy": each AI call was asked for up to 15 questions at once, longer than any free model could write within its time limit. Questions are now written in smaller sets, three at a time, and every call stays inside the time the app waits.
- **Backup AI models set up properly.** Gemini now uses names that keep working when Google renames a release (`gemini-flash-lite-latest`, `gemini-flash-latest`, then the stable `gemini-2.5-flash`); the old default `gemini-3.5-flash` no longer existed. If Gemini is busy, renamed or its key is refused, Cloudflare Workers AI answers (Llama 3.3 70B, then Llama 3.1 8B for Ask).
- **Security:** wrong access codes or admin tokens from one address are locked out for 15 minutes after 20 tries; each network is capped at 300 AI requests an hour; oversized requests are refused; secret checks no longer reveal their length; the access code can be rotated without breaking boards; optional lock to Nepal or to the college network (`ALLOWED_COUNTRIES`, `ALLOWED_IPS`).
- **410 more IOE and IOM questions** in the question bank (physics, chemistry, mathematics, biology, English; Grade 11 and 12). Each is re-solved by the AI check before any class sees it.

## 1.7.0 (15 October 2026)
**The app itself updates in one click from now on.** Older apps receive 1.7.0 through Check for updates and then show **Update app to 1.7.0**: on Android it opens the download (tap Install once); on Windows it shows the download page for a one-time install. From 1.7.0, Update app installs new versions by itself.
- **Update app:** the installed app downloads its own new version, checks it and installs it (Windows: silently, then reopens; Android: Android's Update confirmation). Needed for presenting PowerPoint files.
- PowerPoint chapters are no longer converted or re-drawn by the app. The uploaded file is kept exactly as it is, and **Start presentation** opens it in PowerPoint (school computers, straight into the slide show) or the board's office app such as WPS Office (Android). Pictures, fonts, animations and transitions now play exactly as the teacher made them, with no cut-off text.
- Older PowerPoint formats (.ppt, .pps) and .ppsx can be uploaded as they are; no need to re-save them as .pptx.
- Ask AI no longer closes by itself: an answer about a slide stays on screen with a **Go to slide** button, and tapping outside the panel does nothing.
- An answer that cannot be shown now gives a message inside the panel instead of closing the screen; unexpected AI replies are checked before they are shown.

## 1.6.0 (12 October 2026)
**Android: install the 1.6.0 APK once** (needed for the board's own annotation tools).
- Board annotation stays available: the board's own tools (such as the Hikvision annotation pen and side toolbar) are no longer hidden while the app is open. Full screen still hides every bar; **Board pen** brings the board's tools back.
- Built-in pen on every slide: four colours, highlighter, eraser, undo and clear. Ink is kept per slide and never saved into the file.
- Ask AI reads pictures: attach a photo, or send the current PDF slide.
- Ask AI answers study questions beyond the slides, marked as a general answer.
- Quizzes: about half logical and critical-thinking questions (assertion and reason, statements, predict, cause and effect, graph, compare, spot the error), all on the open chapter; the question type is shown on each card.
- Grade 12 chapters get Grade 12 questions only; Class 11 stays Grade 11 only.
- Tests for offline slide search, `npm test`, and CI on every push.

## 1.5.x (10 October 2026)
- 1.5.0: IOE and IOM question bank (252 questions), matched to the open chapter and the class grade.
- 1.5.1: Quizzes of 5 to 50 questions, toughest first, with exact arithmetic checks of every AI-written solution and answers spread evenly over A to D.
- 1.5.2: Absolute values in solutions are checked too; realistic quiz preparation time.

## 1.4.x (7 October 2026)
**Android: install the 1.4.0 APK once** (fixes in-app updates on Android).
- 1.4.0: Android updates are downloaded and saved byte for byte, so their integrity check passes.
- 1.4.1: Fast, bounded AI answers with automatic fall-back between free models; quiz keys re-checked.

## 1.3.0 (7 October 2026)
- Upload PowerPoint (.pptx) and text (.txt) chapters as well as PDF.

## 1.2.x (6 to 7 October 2026)
- 1.2.0: Ask AI, AI Quiz and slide navigation, grounded in the slides; Start button fits every board.
- AI server on free models only: Google Gemini free tier with Cloudflare Workers AI as the backup.
- 1.2.1: AI works out of the box; true full screen; entrance exams chosen by group.
- 1.2.2: Entrance exams are IOE and IOM.
- 1.2.3: AI solutions shown as bullet steps in textbook notation.
- Updates are published from a GitHub button (Actions, Publish update): no PowerShell on school machines.

## 1.1.0 (5 October 2026)
- Separate storage for every classroom: one section can never open another's files.
- In-app updates without reinstalling.

## 1.0.x (4 to 5 October 2026)
- 1.0: Class, shift, group, section, subject, portion and teacher flow to the chapter presentations, with the official logo.
- Native Android app (APK) for Hikvision boards, and a Windows desktop app with an installer.
- Wi-Fi download page for sharing the APK (`npm run share`).
- 1.0.1 and 1.0.2: Algebra portion, Morning and Day kept separate, section codes, Exit button fix.
