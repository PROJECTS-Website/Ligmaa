# 🎬 MovieVerse

A modern, responsive web application for discovering and exploring movies and TV shows, built with React, Vite, and Tailwind CSS.

![MovieVerse Screenshot](https://github.com/user-attachments/assets/9806b3bc-f681-4247-927b-e0b50fc9fd72)

## ✨ Features

- 🎥 Browse trending, popular, and top-rated movies and TV shows
- 🔍 Advanced search functionality
- 📱 Fully responsive design for all devices
- 🎬 Watch trailers and view detailed information
- ⚡ Fast and optimized performance with Vite
- 🎨 Beautiful UI with Tailwind CSS
- 🔄 Infinite scroll for seamless browsing
- 🎞️ Interactive movie/TV show details page
- 🎭 Browse by categories and genres

## 🚀 Tech Stack

- **Frontend**: React 19
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Icons**: Hero Icons
- **API**: TMDb API
- **Build Tool**: Vite
- **Carousel**: Swiper.js
- **HTTP Client**: Axios

## 🛠️ Prerequisites

- Node.js (v16 or later)
- npm or yarn
- TMDb API key (get it from [TMDB](https://www.themoviedb.org/settings/api))

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone git@github.com:P0SSIBLE-0/movieverse.git
   cd movieverse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn
   ```

3. **Create a .env file**
   Create a `.env` file in the root directory and add your TMDb API key:
   ```
   VITE_TMDB_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open in browser**
   The app will be running at [http://localhost:5173](http://localhost:5173)

## 📂 Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable components
│   └── details/     # Detail page components
├── context/         # React context providers
├── hooks/           # Custom React hooks
├── pages/           # Page components
├── services/        # API services
└── utils/           # Utility functions
```

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌟 Features in Detail

### 🎥 Home Page
- Displays trending movies and TV shows
- Category-wise sections
- Responsive grid layout

### 🔍 Search
- Real-time search functionality
- Search across movies and TV shows
- Responsive search interface

### 🎬 Details Page
- Comprehensive movie/TV show information
- Cast and crew details
- Trailers and videos
- Similar recommendations
- Responsive design

## 📱 Responsive Design
- Mobile-first approach
- Responsive navigation
- Adaptive layouts for all screen sizes
- Touch-friendly controls

## 📚 API Usage
This project uses the TMDb API but is not endorsed or certified by TMDb.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TMDb](https://www.themoviedb.org/) for the movie data
- [Vite](https://vitejs.dev/) for the amazing build tool
- [React](https://reactjs.org/) for the UI library
- [Tailwind CSS](https://tailwindcss.com/) for styling
