# Capstone Shery Folder Structure

This document provides a complete layout of the files and directories in the **capstone-shery** workspace.

## Folder Tree

```text
capstone-shery/
├── .github/
│   └── workflows/
│       └── ci.yml
├── client/
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── GuestRoute.tsx
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   ├── ui/
│   │   │   │   ├── Avatar.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── BrowserMockup.tsx
│   │   │   │   ├── EmptyState.tsx
│   │   │   │   ├── Gridscan.tsx
│   │   │   │   ├── LoadingScreen.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── RevealText.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   ├── ThemeToggle.tsx
│   │   │   │   ├── Toast.tsx
│   │   │   │   ├── Typewriter.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   └── useCursor.tsx
│   │   │   ├── DotField.tsx
│   │   │   └── Particles.tsx
│   │   ├── features/
│   │   │   ├── account/
│   │   │   │   └── components/
│   │   │   │       └── AccountPage.tsx
│   │   │   ├── auth/
│   │   │   │   ├── api/
│   │   │   │   │   └── auth.api.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── LoginForm.tsx
│   │   │   │   │   └── SignupForm.tsx
│   │   │   │   ├── context/
│   │   │   │   │   ├── AuthContext.tsx
│   │   │   │   │   └── AuthContextDef.ts
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useAuth.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── auth.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── dashboard/
│   │   │   │   ├── api/
│   │   │   │   │   └── projects.api.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── DeleteConfirmModal.tsx
│   │   │   │   │   ├── NewProjectModal.tsx
│   │   │   │   │   ├── ProjectCard.tsx
│   │   │   │   │   ├── ProjectGrid.tsx
│   │   │   │   │   └── RenameModal.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   └── useProjects.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── project.types.ts
│   │   │   │   └── index.ts
│   │   │   ├── editor/
│   │   │   │   ├── api/
│   │   │   │   │   ├── export.api.ts
│   │   │   │   │   └── generate.api.ts
│   │   │   │   ├── components/
│   │   │   │   │   ├── EditorLayout.tsx
│   │   │   │   │   ├── EditorToolbar.tsx
│   │   │   │   │   ├── MonacoEditor.tsx
│   │   │   │   │   ├── PreviewScreen.tsx
│   │   │   │   │   ├── PromptPanel.tsx
│   │   │   │   │   ├── StreamingView.tsx
│   │   │   │   │   └── WelcomeScreen.tsx
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useEditHistory.ts
│   │   │   │   │   └── useGenerate.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── editor.types.ts
│   │   │   │   ├── utils/
│   │   │   │   │   └── htmlParser.ts
│   │   │   │   └── index.ts
│   │   │   └── preview/
│   │   │       ├── components/
│   │   │       │   ├── ConsoleErrorPanel.tsx
│   │   │       │   ├── PreviewPane.tsx
│   │   │       │   ├── SectionHighlight.tsx
│   │   │       │   └── ViewportToggle.tsx
│   │   │       ├── hooks/
│   │   │       │   ├── useSectionClick.ts
│   │   │       │   └── useWebContainer.ts
│   │   │       ├── types/
│   │   │       │   └── preview.types.ts
│   │   │       └── index.ts
│   │   ├── lib/
│   │   │   ├── ThemeContext.tsx
│   │   │   ├── animations.ts
│   │   │   ├── monaco.ts
│   │   │   ├── supabase copy.ts
│   │   │   ├── supabase.ts
│   │   │   └── utils.ts
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── EditorPage.tsx
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginPage.tsx
│   │   │   ├── NotFoundPage.tsx
│   │   │   ├── PreviewPage.tsx
│   │   │   ├── ResetPasswordPage.tsx
│   │   │   └── SignupPage.tsx
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   ├── Input.tsx
│   │   │   │   ├── LoadingSkeleton.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── hooks/
│   │   │   │   └── useToast.ts
│   │   │   ├── types/
│   │   │   │   └── common.types.ts
│   │   │   ├── classifier.ts
│   │   │   └── index.ts
│   │   ├── styles/
│   │   │   ├── globals.css
│   │   │   └── index.css
│   │   ├── App.tsx
│   │   ├── framer-motion.d.ts
│   │   ├── main.tsx
│   │   └── vite-env.d.ts
│   ├── .env
│   ├── .env.example
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   ├── components.json
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
├── server/
│   ├── app/
│   │   ├── models/
│   │   │   └── __init__.py
│   │   ├── prompts/
│   │   │   ├── __init__.py
│   │   │   └── website_prompt.py
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   ├── generate.py
│   │   │   ├── projects.py
│   │   │   └── stream.py
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── llm_service.py
│   │   │   ├── nova_service.py
│   │   │   └── project_service.py
│   │   ├── streaming/
│   │   │   └── __init__.py
│   │   ├── utils/
│   │   │   └── __init__.py
│   │   ├── validators/
│   │   │   ├── __init__.py
│   │   │   └── generate_request.py
│   │   ├── __init__.py
│   │   └── main.py
│   ├── data/
│   │   └── projects.json
│   ├── src/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   ├── auth.router.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.types.ts
│   │   │   ├── export/
│   │   │   │   ├── export.router.ts
│   │   │   │   ├── export.service.ts
│   │   │   │   └── export.types.ts
│   │   │   ├── generate/
│   │   │   │   ├── generate.router.ts
│   │   │   │   ├── generate.service.ts
│   │   │   │   ├── generate.types.ts
│   │   │   │   └── prompt.ts
│   │   │   └── projects/
│   │   │       ├── projects.router.ts
│   │   │       ├── projects.service.ts
│   │   │       └── projects.types.ts
│   │   ├── lib/
│   │   │   ├── bedrock.ts
│   │   │   ├── logger.ts
│   │   │   └── supabase.ts
│   │   ├── middleware/
│   │   │   ├── authGuard.ts
│   │   │   ├── errorHandler.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── sanitise.ts
│   │   └── index.ts
│   ├── .env
│   ├── .eslintrc.cjs
│   ├── .gitignore
│   ├── package.json
│   ├── requirements.txt
│   ├── server_debug.log
│   └── tsconfig.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql
│       └── 002_enable_google_oauth.md
├── .gitignore
├── README.md
└── how 5fd9ae2
```

---
*Generated automatically by Antigravity.*
