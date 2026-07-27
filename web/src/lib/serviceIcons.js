import {
  FaLaptopCode,
  FaDatabase,
  FaPenNib,
  FaAndroid,
  FaCogs,
  FaMobileAlt,
  FaPaintBrush,
  FaServer,
  FaCode,
  FaReact,
} from "react-icons/fa";

// Maps the stored icon key string -> a react-icons component. The admin
// Services editor offers exactly these keys, so the two stay in sync.
export const iconMap = {
  FaLaptopCode,
  FaDatabase,
  FaPenNib,
  FaAndroid,
  FaCogs,
  FaMobileAlt,
  FaPaintBrush,
  FaServer,
  FaCode,
  FaReact,
};

export const ICON_KEYS = Object.keys(iconMap);

export const renderServiceIcon = (key) => {
  const Icon = iconMap[key] || FaCogs;
  return <Icon />;
};
