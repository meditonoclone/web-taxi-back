-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1:3307
-- Thời gian đã tạo: Th8 30, 2024 lúc 08:26 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `taxi_dev`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `driver_profile`
--

CREATE TABLE `driver_profile` (
  `profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `license_number` varchar(255) NOT NULL,
  `license_expiry_date` date NOT NULL,
  `vehicle_type` int(11) NOT NULL DEFAULT 1,
  `vehicle_number` varchar(255) DEFAULT NULL,
  `vehicle_color` varchar(50) DEFAULT NULL,
  `status` enum('active','inactive','suspended') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `driver_profile`
--

INSERT INTO `driver_profile` (`profile_id`, `user_id`, `license_number`, `license_expiry_date`, `vehicle_type`, `vehicle_number`, `vehicle_color`, `status`, `created_at`, `updated_at`) VALUES
(1, 2, 'DL001122334455', '2025-06-30', 1, '51A-12345', 'Trắng', 'active', '2024-07-26 03:49:54', '2024-08-19 09:30:33'),
(2, 3, 'DL223344556677', '2024-12-31', 2, '51B-67890', 'Đen', 'active', '2024-07-26 03:49:54', '2024-08-19 09:30:38'),
(3, 4, 'DL445566778899', '2026-03-15', 3, '51C-24680', 'Xanh', 'active', '2024-07-26 03:49:54', '2024-08-19 09:30:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `images`
--

CREATE TABLE `images` (
  `image_id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `profile_id` int(11) DEFAULT NULL,
  `news_id` int(11) DEFAULT NULL,
  `image_url` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `position` enum('thumbnail','content') DEFAULT 'content',
  `uploaded_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `images`
--

INSERT INTO `images` (`image_id`, `user_id`, `profile_id`, `news_id`, `image_url`, `description`, `position`, `uploaded_at`) VALUES
(1, NULL, NULL, 1, 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7', 'Người đàn ông sử dụng điện thoại di động', 'thumbnail', '2024-07-26 03:56:17'),
(2, NULL, NULL, 1, 'https://images.unsplash.com/photo-1560438718-eb61ede255eb', 'Ứng dụng đặt xe trên điện thoại thông minh', 'content', '2024-07-26 03:56:17'),
(3, NULL, NULL, 1, 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d', 'Taxi trên đường phố', 'content', '2024-07-26 03:56:17'),
(4, NULL, NULL, 1, 'https://images.unsplash.com/photo-1580273916550-e323be2ae537', 'Người phụ nữ đang chờ xe', 'content', '2024-07-26 03:56:17'),
(5, NULL, NULL, 2, 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'Bãi biển tropical đẹp', 'thumbnail', '2024-07-26 03:56:17'),
(6, NULL, NULL, 2, 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4', 'Thành phố New York về đêm', 'content', '2024-07-26 03:56:17'),
(7, NULL, NULL, 2, 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be', 'Hồ bơi vô cực tại khu nghỉ dưỡng', 'content', '2024-07-26 03:56:17'),
(8, NULL, NULL, 2, 'https://images.unsplash.com/photo-1530521954074-e64f6810b32d', 'Cảnh hoàng hôn trên bãi biển', 'content', '2024-07-26 03:56:17'),
(9, NULL, NULL, 3, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c', 'Ví tiền và vé máy bay', 'thumbnail', '2024-07-26 03:56:17'),
(10, NULL, NULL, 3, 'https://images.unsplash.com/photo-1563013544-824ae1b704d3', 'Người đàn ông đang so sánh giá vé trên máy tính', 'content', '2024-07-26 03:56:17'),
(11, NULL, NULL, 3, 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6', 'Ứng dụng so sánh giá vé trên điện thoại', 'content', '2024-07-26 03:56:17'),
(12, NULL, NULL, 3, 'https://images.unsplash.com/photo-1501785888041-af3ef285b470', 'Người du lịch với ba lô trên lưng', 'content', '2024-07-26 03:56:17'),
(13, NULL, NULL, 4, 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2', 'Xe tự lái concept', 'thumbnail', '2024-07-26 03:56:17'),
(14, NULL, NULL, 4, 'https://images.unsplash.com/photo-1516638129451-68a7a2a2fd7d', 'Hệ thống quản lý giao thông thông minh', 'content', '2024-07-26 03:56:17'),
(15, NULL, NULL, 4, 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54', 'Robot trong kho logistics', 'content', '2024-07-26 03:56:17'),
(16, NULL, NULL, 4, 'https://images.unsplash.com/photo-1586696621831-7e5a23dc0363', 'Giao diện phần mềm AI', 'content', '2024-07-26 03:56:17'),
(17, NULL, NULL, 5, 'https://images.unsplash.com/photo-1445965860585-d6605521f68d', 'Xe hơi đang lái trong mưa lớn', 'thumbnail', '2024-07-26 03:56:17'),
(18, NULL, NULL, 5, 'https://images.unsplash.com/photo-1532210317995-cc56d90177d9', 'Kiểm tra lốp xe trước khi lái', 'content', '2024-07-26 03:56:17'),
(19, NULL, NULL, 5, 'https://images.unsplash.com/photo-1494794506857-df74e129a125', 'Lái xe trong sương mù', 'content', '2024-07-26 03:56:17'),
(20, NULL, NULL, 5, 'https://images.unsplash.com/photo-1517147177326-b37599372b73', 'Đèn pha xe trong đêm mưa', 'content', '2024-07-26 03:56:17'),
(21, NULL, NULL, 6, 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42', 'Điện thoại thông minh hiển thị nhiều ứng dụng', 'thumbnail', '2024-07-26 03:56:17'),
(22, NULL, NULL, 6, 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e', 'Người sử dụng ứng dụng bản đồ trên điện thoại', 'content', '2024-07-26 03:56:17'),
(23, NULL, NULL, 6, 'https://images.unsplash.com/photo-1473042904451-00171c69419d', 'Đặt phòng khách sạn trên ứng dụng di động', 'content', '2024-07-26 03:56:17'),
(24, NULL, NULL, 6, 'https://images.unsplash.com/photo-1523111343671-1c69b2e490f4', 'Ứng dụng dịch ngôn ngữ', 'content', '2024-07-26 03:56:17'),
(25, NULL, NULL, 7, 'https://images.unsplash.com/photo-1581362653346-e650882ac73c', 'Các phương tiện giao thông khác nhau', 'thumbnail', '2024-07-26 03:56:17'),
(26, NULL, NULL, 7, 'https://images.unsplash.com/photo-1545495728-d81330c70f1c', 'Nội thất sang trọng của máy bay', 'content', '2024-07-26 03:56:17'),
(27, NULL, NULL, 7, 'https://images.unsplash.com/photo-1556767576-5ec41e3239ea', 'Ga tàu cao tốc', 'content', '2024-07-26 03:56:17'),
(28, NULL, NULL, 7, 'https://images.unsplash.com/photo-1548777123-e216912df7d8', 'Xe buýt du lịch', 'content', '2024-07-26 03:56:17'),
(29, NULL, NULL, 8, 'https://images.unsplash.com/photo-1566998886212-9a056f0c04fd', 'Biển báo giao thông', 'thumbnail', '2024-07-26 03:56:17'),
(30, NULL, NULL, 8, 'https://images.unsplash.com/photo-1603213290856-76f2159c5a81', 'Cảnh sát giao thông đang làm việc', 'content', '2024-07-26 03:56:17'),
(31, NULL, NULL, 8, 'https://images.unsplash.com/photo-1597762117709-859f744b84c3', 'Đèn giao thông tại ngã tư', 'content', '2024-07-26 03:56:17'),
(32, NULL, NULL, 8, 'https://images.unsplash.com/photo-1543549790-8b5f4a028cfb', 'Người lái xe đang thắt dây an toàn', 'content', '2024-07-26 03:56:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `news`
--

CREATE TABLE `news` (
  `news_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `content` text NOT NULL,
  `author_id` int(11) NOT NULL,
  `published_date` date DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `tag` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `status` enum('draft','published','archived') DEFAULT 'published'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `news`
--

INSERT INTO `news` (`news_id`, `title`, `description`, `content`, `author_id`, `published_date`, `slug`, `tag`, `created_at`, `updated_at`, `status`) VALUES
(1, 'Hướng dẫn đặt xe trực tuyến cho người mới bắt đầu', 'Tìm hiểu cách đặt xe trực tuyến một cách dễ dàng và an toàn', 'Đặt xe trực tuyến là một phương tiện di chuyển tiện lợi trong thời đại số. Bài viết này sẽ hướng dẫn bạn từng bước cách đặt xe, từ tạo tài khoản đến hoàn tất chuyến đi. Chúng tôi cũng sẽ chia sẻ các mẹo để đảm bảo an toàn và tận hưởng trải nghiệm tốt nhất.', 1, '2024-07-15', 'huong-dan-dat-xe-truc-tuyen-cho-nguoi-moi-bat-dau', 'Hướng dẫn, Đặt xe', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'published'),
(2, '5 địa điểm du lịch hot nhất mùa hè này', 'Khám phá những điểm đến hấp dẫn cho kỳ nghỉ hè của bạn', 'Mùa hè đã đến, đây là thời điểm lý tưởng để lên kế hoạch cho một chuyến du lịch. Bài viết này sẽ giới thiệu 5 địa điểm du lịch hot nhất mùa hè này, từ bãi biển tropical đến những thành phố sôi động. Mỗi địa điểm đều có những đặc trưng riêng và hứa hẹn mang lại những trải nghiệm khó quên.', 1, '2024-07-20', '5-dia-diem-du-lich-hot-nhat-mua-he-nay', 'Du lịch, Mùa hè', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'published'),
(3, 'Cách tiết kiệm chi phí đi lại trong mùa cao điểm', 'Những mẹo hữu ích giúp bạn tiết kiệm khi di chuyển', 'Mùa cao điểm thường đi kèm với giá cả tăng cao, đặc biệt là chi phí đi lại. Bài viết này sẽ cung cấp cho bạn những mẹo hữu ích để tiết kiệm chi phí di chuyển, từ việc đặt vé sớm, sử dụng các ứng dụng so sánh giá, đến việc tận dụng các chương trình khuyến mãi. Áp dụng những mẹo này, bạn sẽ có thể tiết kiệm đáng kể trong những chuyến đi của mình.', 2, '2024-07-25', 'cach-tiet-kiem-chi-phi-di-lai-trong-mua-cao-diem', 'Tiết kiệm, Di chuyển', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'published'),
(4, 'Xu hướng công nghệ mới trong ngành vận tải', 'Khám phá những công nghệ đang định hình tương lai của ngành vận tải', 'Ngành vận tải đang trải qua một cuộc cách mạng công nghệ. Từ xe tự lái đến ứng dụng AI trong quản lý giao thông, bài viết này sẽ điểm qua những xu hướng công nghệ mới nhất đang định hình tương lai của ngành. Chúng ta sẽ thảo luận về tác động của những công nghệ này đối với trải nghiệm của người dùng và hiệu quả vận hành của doanh nghiệp.', 3, '2024-08-01', 'xu-huong-cong-nghe-moi-trong-nganh-van-tai', 'Công nghệ, Vận tải', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'draft'),
(5, 'Lái xe an toàn trong điều kiện thời tiết xấu', 'Những lưu ý quan trọng khi lái xe trong mưa bão', 'Thời tiết xấu có thể gây ra nhiều thách thức cho người lái xe. Bài viết này sẽ cung cấp những lời khuyên hữu ích để lái xe an toàn trong điều kiện mưa bão, sương mù hay tuyết rơi. Từ việc kiểm tra xe trước khi khởi hành đến các kỹ thuật lái xe phù hợp, những thông tin này sẽ giúp bạn tự tin hơn khi phải di chuyển trong điều kiện thời tiết không thuận lợi.', 2, '2024-08-05', 'lai-xe-an-toan-trong-dieu-kien-thoi-tiet-xau', 'An toàn, Lái xe', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'published'),
(6, 'Top 10 ứng dụng di động hữu ích cho người đi du lịch', 'Những ứng dụng không thể thiếu cho chuyến du lịch của bạn', 'Trong thời đại số, smartphone đã trở thành người bạn đồng hành không thể thiếu trong mỗi chuyến đi. Bài viết này sẽ giới thiệu 10 ứng dụng di động hữu ích nhất cho người đi du lịch, từ ứng dụng đặt vé, tìm nhà hàng đến các ứng dụng hỗ trợ ngôn ngữ và chỉ đường. Với những ứng dụng này, bạn sẽ có thể tự tin khám phá bất kỳ điểm đến nào trên thế giới.', 3, '2024-08-10', 'top-10-ung-dung-di-dong-huu-ich-cho-nguoi-di-du-lich', 'Ứng dụng, Du lịch', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'published'),
(7, 'Cách chọn phương tiện di chuyển phù hợp cho từng loại chuyến đi', 'Hướng dẫn lựa chọn phương tiện di chuyển hiệu quả', 'Mỗi chuyến đi đều có những yêu cầu riêng về phương tiện di chuyển. Bài viết này sẽ phân tích ưu nhược điểm của từng loại phương tiện (xe buýt, tàu hỏa, máy bay, xe hơi) và đưa ra gợi ý về cách chọn phương tiện phù hợp nhất cho từng loại chuyến đi, dựa trên các yếu tố như khoảng cách, thời gian, ngân sách và mục đích chuyến đi.', 1, '2024-08-15', 'cach-chon-phuong-tien-di-chuyen-phu-hop-cho-tung-loai-chuyen-di', 'Phương tiện, Di chuyển', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'draft'),
(8, 'Những quy định mới về giao thông đường bộ năm 2024', 'Cập nhật những thay đổi quan trọng trong luật giao thông', 'Năm 2024 chứng kiến nhiều thay đổi trong quy định giao thông đường bộ. Bài viết này sẽ tổng hợp và phân tích những quy định mới quan trọng nhất, từ mức phạt cho các vi phạm đến các quy định về an toàn và bảo vệ môi trường. Hiểu rõ những quy định này sẽ giúp bạn lái xe an toàn và tránh những rắc rối không đáng có trên đường.', 2, '2024-08-20', 'nhung-quy-dinh-moi-ve-giao-thong-duong-bo-nam-2024', 'Luật giao thông, Cập nhật', '2024-07-26 03:52:50', '2024-07-26 03:52:50', 'published');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `taxi_pricing`
--

CREATE TABLE `taxi_pricing` (
  `vehicle_type_id` int(11) NOT NULL,
  `vehicle_type` varchar(50) NOT NULL,
  `base_fare` decimal(10,2) NOT NULL,
  `fare_first_10km` decimal(10,2) NOT NULL,
  `fare_10_to_30km` decimal(10,2) NOT NULL,
  `fare_above_30km` decimal(10,2) NOT NULL,
  `waiting_time_fare` decimal(10,2) NOT NULL DEFAULT 45000.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `taxi_pricing`
--

INSERT INTO `taxi_pricing` (`vehicle_type_id`, `vehicle_type`, `base_fare`, `fare_first_10km`, `fare_10_to_30km`, `fare_above_30km`, `waiting_time_fare`) VALUES
(1, '4 chỗ lớn', 12000.00, 13000.00, 11000.00, 9000.00, 45000.00),
(2, '4 chỗ nhỏ', 10000.00, 11000.00, 9000.00, 7000.00, 45000.00),
(3, '7 chỗ', 14000.00, 15000.00, 13000.00, 11000.00, 45000.00);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `trip_history`
--

CREATE TABLE `trip_history` (
  `trip_id` int(11) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `driver_id` int(11) DEFAULT NULL,
  `vehicle_type_id` int(11) NOT NULL,
  `from_location` varchar(255) NOT NULL,
  `to_location` varchar(255) DEFAULT NULL,
  `contact` varchar(11) NOT NULL,
  `order_time` datetime NOT NULL,
  `finished_time` datetime DEFAULT NULL,
  `distance` decimal(10,2) DEFAULT NULL,
  `cost` decimal(10,2) DEFAULT NULL,
  `waiting_minutes` int(11) DEFAULT 0,
  `status` enum('cancel','waiting','booked','en route','in transit','completed') NOT NULL DEFAULT 'booked'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `trip_history`
--

INSERT INTO `trip_history` (`trip_id`, `client_id`, `driver_id`, `vehicle_type_id`, `from_location`, `to_location`, `contact`, `order_time`, `finished_time`, `distance`, `cost`, `waiting_minutes`, `status`) VALUES
(1, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-27 09:48:51', NULL, NULL, NULL, 0, 'booked'),
(2, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-27 09:52:21', NULL, NULL, NULL, 0, 'booked'),
(3, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-27 09:53:15', NULL, NULL, NULL, 0, 'booked'),
(4, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-27 09:53:30', NULL, NULL, NULL, 0, 'booked'),
(5, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-27 09:55:03', NULL, NULL, NULL, 0, 'booked'),
(6, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-27 09:55:43', NULL, NULL, NULL, 0, 'booked'),
(7, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-29 02:41:59', NULL, NULL, NULL, 0, 'booked'),
(8, NULL, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-29 02:45:10', NULL, NULL, NULL, 0, 'booked'),
(9, 1, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-29 02:47:23', NULL, NULL, NULL, 0, 'booked'),
(10, 5, NULL, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-29 03:31:11', NULL, NULL, NULL, 0, 'booked'),
(11, 5, 3, 1, 'Biên Hòa', 'Buôn Ma Thuột', '0909090990', '2024-08-29 03:34:21', NULL, NULL, NULL, 0, 'booked');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user`
--

CREATE TABLE `user` (
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `email` varchar(255) NOT NULL,
  `account_type` enum('client','admin','driver') NOT NULL DEFAULT 'client',
  `address` varchar(255) NOT NULL,
  `profile_picture` varchar(255) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `user`
--

INSERT INTO `user` (`user_id`, `name`, `phone`, `email`, `account_type`, `address`, `profile_picture`, `password`, `created_at`, `updated_at`) VALUES
(1, 'Nguyễn Văn An', '0901234567', 'nguyenvanan@gmail.com', 'admin', '123 Lê Lợi, Quận 1, TP.HCM', 'https://images.unsplash.com/photo-1560250097-0b93528c311a', 'admin123', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(2, 'Trần Thị Bình', '0912345678', 'tranthib@gmail.com', 'driver', '456 Nguyễn Huệ, Quận 1, TP.HCM', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e', 'driver123', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(3, 'Lê Văn Cường', '0923456789', 'levanc@gmail.com', 'driver', '789 Trần Hưng Đạo, Quận 5, TP.HCM', 'https://images.unsplash.com/photo-1566492031773-4f4e44671857', 'driver456', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(4, 'Phạm Thị Dung', '0934567890', 'phamthid@gmail.com', 'driver', '101 Võ Văn Tần, Quận 3, TP.HCM', 'https://images.unsplash.com/photo-1580489944761-15a19d654956', 'driver789', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(5, 'Hoàng Văn Em', '0945678901', 'hoangvane@gmail.com', 'client', '202 Nguyễn Thị Minh Khai, Quận 3, TP.HCM', 'https://images.unsplash.com/photo-1607990281513-2c110a25bd8c', 'client123', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(6, 'Ngô Thị Phương', '0956789012', 'ngothip@gmail.com', 'client', '303 Điện Biên Phủ, Bình Thạnh, TP.HCM', 'https://images.unsplash.com/photo-1581403341630-a6e0b9d2d257', 'client456', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(7, 'Đặng Văn Giàu', '0967890123', 'dangvang@gmail.com', 'client', '404 Nguyễn Văn Linh, Quận 7, TP.HCM', 'https://images.unsplash.com/photo-1542909168-82c3e7fdca5c', 'client789', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(8, 'Bùi Thị Hoa', '0978901234', 'buithih@gmail.com', 'client', '505 Phan Xích Long, Phú Nhuận, TP.HCM', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2', 'clientabc', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(9, 'Lý Văn Inh', '0989012345', 'lyvani@gmail.com', 'client', '606 Cách Mạng Tháng 8, Quận 3, TP.HCM', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d', 'clientdef', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(10, 'Trương Thị Kim', '0990123456', 'truongthik@gmail.com', 'client', '707 Nguyễn Đình Chiểu, Quận 3, TP.HCM', 'https://images.unsplash.com/photo-1554151228-14d9def656e4', 'clientxyz', '2024-07-26 03:43:45', '2024-07-26 03:43:45'),
(11, 'Tiến Trần', '0866840075', 'meditonoclone@gmail.com', 'client', '', NULL, 'admin123', '2024-08-08 09:45:03', '2024-08-08 09:45:03');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `driver_profile`
--
ALTER TABLE `driver_profile`
  ADD PRIMARY KEY (`profile_id`),
  ADD UNIQUE KEY `license_number` (`license_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `fk_vehicle_type` (`vehicle_type`);

--
-- Chỉ mục cho bảng `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `profile_id` (`profile_id`),
  ADD KEY `news_id` (`news_id`);

--
-- Chỉ mục cho bảng `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`news_id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Chỉ mục cho bảng `taxi_pricing`
--
ALTER TABLE `taxi_pricing`
  ADD PRIMARY KEY (`vehicle_type_id`),
  ADD UNIQUE KEY `vehicle_type` (`vehicle_type`) USING BTREE;

--
-- Chỉ mục cho bảng `trip_history`
--
ALTER TABLE `trip_history`
  ADD PRIMARY KEY (`trip_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `driver_id` (`driver_id`),
  ADD KEY `vehicle_type_id` (`vehicle_type_id`);

--
-- Chỉ mục cho bảng `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `driver_profile`
--
ALTER TABLE `driver_profile`
  MODIFY `profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `images`
--
ALTER TABLE `images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- AUTO_INCREMENT cho bảng `news`
--
ALTER TABLE `news`
  MODIFY `news_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT cho bảng `taxi_pricing`
--
ALTER TABLE `taxi_pricing`
  MODIFY `vehicle_type_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `trip_history`
--
ALTER TABLE `trip_history`
  MODIFY `trip_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT cho bảng `user`
--
ALTER TABLE `user`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `driver_profile`
--
ALTER TABLE `driver_profile`
  ADD CONSTRAINT `driver_profile_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vehicle_type` FOREIGN KEY (`vehicle_type`) REFERENCES `taxi_pricing` (`vehicle_type_id`);

--
-- Các ràng buộc cho bảng `images`
--
ALTER TABLE `images`
  ADD CONSTRAINT `images_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `user` (`user_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `images_ibfk_2` FOREIGN KEY (`profile_id`) REFERENCES `driver_profile` (`profile_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `images_ibfk_3` FOREIGN KEY (`news_id`) REFERENCES `news` (`news_id`) ON DELETE SET NULL;

--
-- Các ràng buộc cho bảng `trip_history`
--
ALTER TABLE `trip_history`
  ADD CONSTRAINT `trip_history_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `trip_history_ibfk_2` FOREIGN KEY (`driver_id`) REFERENCES `user` (`user_id`),
  ADD CONSTRAINT `trip_history_ibfk_3` FOREIGN KEY (`vehicle_type_id`) REFERENCES `taxi_pricing` (`vehicle_type_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
