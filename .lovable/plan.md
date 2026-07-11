## Fix: chat scroll leaking to the page

When scrolling up inside the Pilot chat widget, the whole page scrolls too. Cause: the messages container in `src/components/ChatWidget.tsx` scrolls, but when it reaches the top the browser continues the scroll on the page (scroll chaining).

### Change
- `src/components/ChatWidget.tsx` — on the messages scroll container (line 169), add `overscroll-contain` so scroll stops at the widget boundary and doesn't bubble to the page.

That's the only edit — no logic, layout, or styling changes elsewhere.