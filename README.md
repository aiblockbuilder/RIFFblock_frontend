# RIFFBLOCK Frontend

This project is the frontend for the RIFFBLOCK application, a music NFT marketplace that allows artists to create, distribute, and monetize music through blockchain technology.

## Project Structure

- **components/**: Contains reusable components used across the application.
  - **profile/**: Components related to user profiles.
    - `profile-header.tsx`: Displays the user's profile header with options to edit profile details.
    - `riff-gallery.tsx`: Displays a gallery of riffs with options to play, like, and share.
  - **ui/**: UI components like buttons, inputs, and modals.
  - **layouts/**: Layout components for structuring pages.
  - **upload/**: Components related to uploading riffs.
  - **animations/**: Animation components for enhancing user experience.

- **app/**: Contains the main pages of the application.
  - **profile/**: Profile-related pages.
    - `page.tsx`: The main profile page component.
  - **market/**: Market-related pages.
  - **upload/**: Upload-related pages.
  - **invest/**: Investment-related pages.
  - **about/**: About page.
  - `page.tsx`: The home page component.
  - `layout.tsx`: The main layout component.
  - `globals.css`: Global styles for the application.

## Features

- **Profile Management**: Users can edit their profile details, including name, bio, location, and social links.
- **Riff Gallery**: Users can view their riffs in a grid or list format, with options to play, like, and share riffs.
- **Upload Riff**: Users can upload new riffs to their profile.
- **Market**: Users can browse and purchase riffs from other artists.
- **Invest**: Users can invest in riffs and artists.

## Getting Started

1. Clone the repository.
2. Install dependencies using `npm install`.
3. Run the development server with `npm run dev`.

## Technologies Used

- **Next.js**: A React framework for building server-rendered applications.
- **TypeScript**: A typed superset of JavaScript.
- **Tailwind CSS**: A utility-first CSS framework for styling.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes. 