import ioeLogo from "./ioeLogo.png";

const Header = () => {
  return (
    <header className="flex flex-col md:flex-row items-center justify-center bg-white p-4 shadow-md">
      <img
        src={ioeLogo}
        alt="IOE Pulchowk Campus Logo"
        className="w-auto h-auto max-h-32 object-contain md:mr-12"
      />
      <div className="text-center mt-6 md:mt-0">
        <h1 className="text-2xl font-bold text-gray-800">
          IOE Pulchowk Campus
        </h1>
        <p className="text-lg text-gray-700">
          Department of Electronics and Computer Engineering
        </p>
      </div>
    </header>
  );
};

export default Header;
