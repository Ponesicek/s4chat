# S4 chat

### My submission for https://cloneathon.t3.chat/

## My Journey

Building S4 Chat has been... an interesting journey. When I started this project for the T3 cloneathon, I wouldn't guess that I would get this far, but here I am, with a fully functioning chatapp. I really enjoyed the last week, since I got to try so many tools that were new to me. Convex, Clerk, openrouter, I love them all <3

### My Stack

Since I like to watch [theo](https://www.youtube.com/@t3dotgg), I have a general knowledge about the webdev world, even though i preffer backend. I ended up going with [Convex](https://www.convex.dev/), because I wanted to have as much time for the frontend as possible. I also picked [Next.js](https://nextjs.org/), since that is what I have the most experience with, [Clerk](https://clerk.com/) for auth and [Openrouter](https://openrouter.ai/) with [Vercel AI SDK](https://ai-sdk.dev/) for my models, since I wanted an all-in-one approach for my AI API.

## Convex

Jesus christ, I fell in love. The ability to just write to DB and know that it WILL be on client. To have all of my code in my frontend folder (I have never used tRPC, but now I am looking forward to it) with fullstack safety. Beautiful.

## Clerk

On the other hand, Clerk was more of a hit or miss for me. The initial setup was great, wrap everything in \<ClerkProvider\> and it was good to go. The devil came after i needed to do settings. Maybe it is just me who can't read, but doing stuff like showing the manage profile popup was weird. Maybe I was too spoiled by Clerk's documentation...

## MCPs
They are great. With one paste of a link, my models became way more usefull. I am looking forward for them to get out of Vercel AI SDK beta, since the integration felt bad, but even with the weird setup (maybe caused a bit by me, since I used [smithery.ai](https://smithery.ai/) as my MCP provider), they were thousand times easier to implement than regular tools.


### What I Learned
Since my previous experiences with React were:
- One unfinished website for my friend
- One AI generated UI by v0

I got to learn many stuff. Noteably, how do server components work (It clicked for me in the middle of the project, that's why they aren't utilised) and it helped my understand hooks a bit better.

### How to run

#### Prerequisites
- Node.js (version 18 or later)
- npm or yarn package manager

#### Environment Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd s4chat
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env.local` file in the root directory with the variables from `.env.example`

#### Service Setup

4. **Convex Setup**:
   - Create a Convex account at [convex.dev](https://convex.dev)
   - Install Convex CLI: `npm install -g convex`
   - Run `npx convex dev` to initialize your Convex project
   - Follow the prompts to create a new project or connect to existing one
   - Your `NEXT_PUBLIC_CONVEX_URL` will be provided after setup

5. **Clerk Setup**:
   - Create a Clerk account at [clerk.com](https://clerk.com)
   - Create a new application
   - Copy your publishable key and secret key to the environment variables
   - Configure the JWT template for Convex integration (see [Clerk + Convex docs](https://docs.convex.dev/auth/clerk))

6. **OpenRouter Setup**:
   - Create an account at [openrouter.ai](https://openrouter.ai)
   - Generate an API key and add it to your environment variables

#### Running the Application

7. Start the development servers:
```bash
npm run dev
```

This will start both the Next.js frontend (`next dev`) and Convex backend (`convex dev`) concurrently.

8. Open [http://localhost:3000](http://localhost:3000) in your browser

#### Production Build

To build for production:
```bash
npm run build
npm start
```

## Limitations
1. The image generation sucks, it doesn't have context about the past and can not take images.
2. Too heavy on backend, didn't have time to optimize it enough.
3. The favicon sucks so hard, I am not a designer :c
