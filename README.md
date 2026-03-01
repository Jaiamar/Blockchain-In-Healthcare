# Blockchain-In-Healthcare

A role-based, blockchain-oriented healthcare web application built with modern React. This application provides a secure interface for different stakeholders in a healthcare network—Patients, Doctors, and Administrators—allowing each to manage records, permissions, and network structures reliably.

## 🌟 Key Features

*   **Role-Based Access Control (RBAC):** Dedicated, secure dashboard views tailored specifically for:
    *   **Patients:** Manage personal health records and grant/revoke access to medical professionals.
    *   **Doctors:** Access permitted patient records, add medical updates, and manage daily interactions.
    *   **Network Admins:** Oversee the structural integrity of the network, manage nodes, and ensure system-wide compliance.
*   **Secure Authentication:** Comprehensive Login and Registration flows managed by a centralized AuthContext.
*   **Network Explorer:** A dedicated explorer page intended for viewing blockchain networks, blocks, or recent transaction history transparently.
*   **Modern User Interface:** Built using React functional components, `react-router-dom` for flexible routing, and Lucide React for consistent and sleek iconography.

## 🛠️ Technology Stack

*   **Frontend Framework:** React 19
*   **Build Tool:** Vite (for lightning-fast HMR and optimized builds)
*   **Routing:** React Router v7
*   **Icons:** Lucide React
*   **Linting:** ESLint

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed (v18 or higher is recommended).

### Installation

1.  **Clone the repository** (if you haven't already):
    ```bash
    git clone https://github.com/Jaiamar/Blockchain-In-Healthcare.git
    cd Blockchain-In-Healthcare
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Start the development server:**
    ```bash
    npm run dev
    ```

4.  **View the application:**
    Open the local server URL to view it in your browser (typically `http://localhost:5173`).

### Building for Production

To create a production-ready build of your app, run:
```bash
npm run build
```
This will compile the application into a `dist/` folder, ready for deployment.

## 📂 Project Structure

A quick overview of the essential project folders:

```text
src/
├── assets/             # Static assets (images, icons, etc.)
├── components/         # Reusable UI components (e.g., Layout wrappers)
├── context/            # Globally shared application state (e.g., AuthContext)
├── pages/              # Primary route views
│   ├── dashboard/      # Role-specific dashboard views (Admin, Doctor, Patient)
│   ├── Explorer.jsx    # Blockchain network/transaction explorer
│   ├── Landing.jsx     # Public-facing landing page
│   ├── Login.jsx       # User authentication entry
│   ├── Register.jsx    # User registration
│   └── Settings.jsx    # User/Account configuration
├── App.jsx             # Main application component & routes provider
└── main.jsx            # Application entry point
```

## 🤝 Contributing

Contributions are always welcome. To contribute:
1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
