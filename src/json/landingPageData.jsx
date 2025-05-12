/* eslint-disable import/extensions */

// Services Img Imports
import American from '../assets/images/Services/american.png';
import chauau from '../assets/images/Services/chau_au.png';
import chauphi from '../assets/images/Services/chau_phi.png';
import van_chuyen_hang_khong from '../assets/images/Services/van_chuyen_hang_khong.jpg';
import thuong_mai_dien_tu from '../assets/images/Services/thuong_mai_dien_tu.jpg';
import van_chuyen_tau from '../assets/images/Services/van_chuyen_tau.webp';


import Man from '../assets/images/user/man.png';
import Girl from '../assets/images/user/girl.png';


// Portfolio Img Imports
import new_1 from '../assets/images/news/new_1.png';
import new_2 from '../assets/images/news/new_2.png';
import new_3 from '../assets/images/news/ebay_express.png';
import new_4 from '../assets/images/news/new_4.png';



// Advantages
import advance_1 from '../assets/images/Advantages/advance_1.png';
import advance_2 from '../assets/images/Advantages/advance_2.png';
import advance_3 from '../assets/images/Advantages/advance_3.png';
import advance_4 from '../assets/images/Advantages/advance_4.png';


export const InformationServices = [
  {
    title: 'Vận chuyển hàng không',
    imageUrl: van_chuyen_hang_khong,
    keyURL: 'vchk',
    animation: 'left',
    description: [
      {
        title: "Chúng tôi liên kết dịch vụ UPS, FedEx, DHL, SF",
        content: [
          "Vận chuyển nhanh chóng quốc tế (2–5 ngày)",
          "Tra cứu lộ trình theo thời gian thực (tracking đầy đủ)",
          "Dịch vụ Door-to-Door: nhận hàng tận nơi, giao hàng tận tay",
          "Thông quan nhanh, hỗ trợ giải quyết thủ tục hải quan",
          "Chính sách bồi thường rõ ràng nếu xảy ra hư hại hoặc mất mát"
        ]
      },
      {
        title: "Các mặt hàng được vận chuyển",
        content: [
          "Chứng từ, tài liệu, hàng mẫu thương mại",
          "Điện tử tiêu dùng: điện thoại, laptop, linh kiện điện tử (được đóng gói đúng chuẩn)",
          "Hàng thời trang, mỹ phẩm, thực phẩm đóng gói hợp lệ",
          "Hàng hóa thương mại có hóa đơn & chứng từ đầy đủ"
        ]
      },
      {
        title: "Các mặt hàng bị hạn chế / cấm",
        content: [
          "Chất cháy nổ, chất lỏng nguy hiểm, pin lithium không đóng gói đúng quy cách",
          "Hàng giả, hàng nhái thương hiệu, hàng cấm theo luật quốc tế",
          "Thực phẩm tươi sống, động vật, thực vật chưa qua kiểm định",
          "Tiền mặt, kim loại quý, vật phẩm có giá trị cao không bảo hiểm"
        ]
      },
      {
        title: "Yêu cầu đóng gói & khai báo",
        content: [
          "Đóng gói chắc chắn, đúng tiêu chuẩn hàng không (UPS/FedEx/DHL/SF cung cấp hộp tiêu chuẩn)",
          "Khai báo chính xác thông tin sản phẩm, trị giá, mục đích sử dụng",
          "Điền đầy đủ thông tin người nhận: họ tên, địa chỉ, số điện thoại, mã zip",
          "Kèm hóa đơn thương mại hoặc phiếu xuất kho nếu là hàng kinh doanh"
        ]
      },
     
      {
        title: "Thời gian vận chuyển tham khảo",
        content: [
          "UPS Express Saver / FedEx International Priority: 2–4 ngày",
          "DHL Express Worldwide: 2–3 ngày làm việc",
          "SF Express Economy: 5–7 ngày (chi phí thấp hơn, thời gian dài hơn)",
          "Thời gian có thể thay đổi tùy khu vực và điều kiện thời tiết"
        ]
      }
    ]
  },
  
  {
    title: 'Vận chuyển thương mại điện tử',
    imageUrl: thuong_mai_dien_tu,
    animation: 'up',
    keyURL: 'tmdt',

    description: [
      {
        title: "Mặt hàng được phép vận chuyển",
        content: [
          "Hàng hóa hợp pháp, có nguồn gốc rõ ràng",
          "Sản phẩm thời trang: quần áo, giày dép, phụ kiện",
          "Đồ điện tử, phụ kiện điện thoại, thiết bị gia dụng nhỏ",
          "Hàng tiêu dùng, mỹ phẩm, sản phẩm chăm sóc cá nhân",
          "Sách vở, văn phòng phẩm, quà tặng",
          "Thực phẩm đóng gói sẵn, có nhãn mác & hạn sử dụng rõ ràng"
        ]
      },
      {
        title: "Mặt hàng không nhận vận chuyển",
        content: [
          "Hàng cấm, hàng giả, hàng vi phạm bản quyền",
          "Vũ khí, chất gây cháy nổ, chất độc hại",
          "Thực phẩm tươi sống, hàng dễ hư hỏng",
          "Tiền mặt, kim loại quý, đá quý, cổ vật có giá trị cao"
        ]
      },
      {
        title: "Lưu ý khi gửi hàng",
        content: [
          "Đóng gói cẩn thận, chống sốc – đặc biệt với hàng dễ vỡ",
          "Ghi rõ thông tin người nhận, bao gồm số điện thoại & địa chỉ chi tiết",
          "Ghi chú rõ ràng với hàng dễ vỡ hoặc cần xử lý đặc biệt",
          "Theo dõi vận đơn để cập nhật tiến trình giao hàng",
          "Kiểm tra kỹ quy định vận chuyển nội địa với từng mặt hàng cụ thể"
        ]
      },
      {
        title: "Ưu đãi từ eBay Express",
        content: [
          "Giao hàng nhanh toàn quốc với giá hợp lý",
          "Miễn phí tư vấn & hỗ trợ đóng gói",
          "Đối soát COD nhanh chóng – minh bạch",
          "Hỗ trợ hoàn hàng nếu giao không thành công",
          "Theo dõi đơn hàng thời gian thực",
          "Hợp tác với các sàn TMĐT và shop online"
        ]
      },
      {
        title: "Thời gian vận chuyển",
        content: [
          "Nội thành: từ 1 – 2 ngày",
          "Liên tỉnh: từ 2 – 4 ngày tùy địa điểm",
          "Khu vực vùng sâu vùng xa có thể lâu hơn"
        ]
      }
    ]
  },
  {
    title: 'Vận chuyển đường biển VN-US',
    imageUrl: van_chuyen_tau,
    animation: 'right',
    keyURL: 'vcdb',

    description: [
      {
        title: "Mặt hàng được phép vận chuyển",
        content: [
          "Hàng hóa công nghiệp, máy móc thiết bị",
          "Hàng nặng, hàng cồng kềnh: nội thất, vật liệu xây dựng",
          "Hàng container nguyên khối (FCL) hoặc lẻ (LCL)",
          "Hóa chất, nguyên liệu sản xuất (theo quy định)",
          "Thực phẩm khô, đóng gói kỹ lưỡng, có chứng từ đầy đủ",
          "Hàng tiêu dùng, đồ điện gia dụng, linh kiện"
        ]
      },
      {
        title: "Mặt hàng không nhận vận chuyển",
        content: [
          "Vũ khí, chất nổ, chất độc hại, hàng nguy hiểm",
          "Hàng cấm theo quy định pháp luật Việt Nam & quốc tế",
          "Động vật sống, thực phẩm tươi sống không bảo quản",
          "Hàng hóa không có chứng từ hợp lệ, nguồn gốc không rõ ràng"
        ]
      },
      {
        title: "Lưu ý khi gửi hàng",
        content: [
          "Đóng gói đạt tiêu chuẩn quốc tế, chịu được va đập và thời tiết",
          "Cung cấp đầy đủ chứng từ: hóa đơn, phiếu xuất kho, MSDS nếu có",
          "Ghi rõ thông tin cảng đi, cảng đến & người nhận",
          "Khai báo chính xác chủng loại, số lượng hàng hóa",
          "Tham khảo trước quy định của từng hãng tàu & quốc gia nhập khẩu"
        ]
      },
      {
        title: "Ưu đãi từ eBay Express",
        content: [
          "Giá cước cạnh tranh, minh bạch chi phí",
          "Hỗ trợ đóng gói, khai báo hải quan",
          "Theo dõi hành trình hàng hóa thường xuyên",
          "Dịch vụ vận chuyển door-to-door nếu khách có nhu cầu",
          "Hợp tác với các hãng tàu lớn, lịch trình ổn định"
        ]
      },
      {
        title: "Thời gian vận chuyển",
        content: [
          "Khu vực châu Á: từ 7 – 14 ngày",
          "Châu Âu & Mỹ: từ 18 – 30 ngày tùy cảng đích",
          "Thời gian có thể thay đổi do thời tiết hoặc lịch trình tàu"
        ]
      }
    ]
  }
];




export const Services = [
  {
    title: 'Vận chuyển hàng hóa đi Mỹ',
    imageUrl: American,
    animation: 'left',
  },
  {
    title: 'Chuyển phát nhanh Châu Âu',
    imageUrl: chauau,
    animation: 'up',
  },
  {
    title: 'Chuyển phát nhanh Châu Âu',
    imageUrl: chauphi,
    animation: 'right',
  },
  
];

export const Portfolios = [
  {
    id: 'asd1293uasdads1',
    title: 'Tình Hình Vận Tải Hàng Hóa',
    imageUrl: new_1,
    type: 'TMDT',
    responsibility: [
      'KINHTE',
      'TMDT',
    ],
    tags: ["công nghệ", "react", "frontend"],
    content: 'Báo cáo tổng quan tình hình vận chuyển hàng hóa trong với các số liệu thực tế, xu hướng tăng trưởng và những thách thức của ngành logistics hiện nay.',
  },
  {
    id: 'asd1293uhjkhkjh12',
    title: "Mỹ - Trung gia tăng áp thuế",
    imageUrl: new_4,
    type: "TMDT",
    responsibility: [
      "KINHTE",
      "TMDT"
    ],
    tags: ["công nghệ", "react", "frontend"],
    content: "Từ khi trở lại Nhà Trắng nhiệm kỳ hai, Tổng thống Donald Trump đã áp thuế lên tới 145% đối với hàng hóa Trung Quốc, làm căng thẳng thương mại leo thang và đẩy thị trường toàn cầu vào trạng thái bất ổn. Mức thuế 245% sau đó được Nhà Trắng làm rõ là tổng hợp nhiều loại thuế cũ, nhưng vẫn khiến dư luận hoang mang. Trung Quốc đáp trả bằng thuế 125% và từ chối đàm phán nếu không có sự bình đẳng, trong khi các tập đoàn Mỹ tại Trung Quốc như Apple, Tesla, Boeing rơi vào thế kẹt. Chuyên gia nhận định ông Trump đang dùng chiến thuật (bờ vực thẳm) để gây áp lực, song chưa chắc sẽ hiệu quả với Bắc Kinh – vốn đã nhiều lần trả đũa mà không nhượng bộ."
  },
  {
    id: 'asd1293uhjkhkjh2',
    title: 'Ship hàng đi Mỹ tại TPHCM',
    imageUrl: new_2,
    type: 'KINHTE',
    responsibility: [
      'KINHTE',
      'TMDT',
    ],
    tags: ["công nghệ", "react", "frontend"],
    content: 'Dịch vụ vận chuyển hàng đi Mỹ tại TP.HCM ngày càng phát triển mạnh. Chúng tôi cung cấp giải pháp gửi hàng nhanh chóng, an toàn đến Mỹ, Châu Âu và toàn cầu với mức giá hợp lý và nhiều ưu đãi hấp dẫn.',
  },
  {
    id: 'asd1293uvbvcbbd3',
    title: 'Gửi Hàng Đi Mỹ Giá Rẻ',
    imageUrl: new_3,
    type: 'KINHTE',
    responsibility: [
      'KINHTE',
      'TMDT',
    ],
    tags: ["công nghệ", "react", "frontend"],
    content: 'Bạn đang tìm dịch vụ gửi hàng đi Mỹ tiết kiệm? Chúng tôi mang đến giải pháp vận chuyển uy tín, giá rẻ cùng nhiều lựa chọn về phương thức giao hàng phù hợp với mọi nhu cầu cá nhân và doanh nghiệp.',
  },
];

export const Advantages = [
  [{
    title: 'Nhận hàng tận nơi',
    description: 'Giao hàng nhanh chóng đến tận tay bạn, bất kể bạn đang ở đâu.',
    imageUrl: advance_1,
  },
  {
    title: 'Hỗ trợ nhanh 24/7',
    description: 'Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn mọi lúc, mọi nơi.',
    imageUrl: advance_2,
  }],
  [{
    title: 'Giá cước cạnh tranh',
    description: 'Chúng tôi cung cấp mức giá tốt nhất với chất lượng dịch vụ vượt trội.',
    imageUrl: advance_3,
  },
  {
    title: 'Đảm bảo sự hài lòng',
    description: 'Cam kết mang đến trải nghiệm dịch vụ chuyên nghiệp và làm hài lòng mọi khách hàng.',
    imageUrl: advance_4,
  }],
];
export const Testimonials = [
  {
    id: 1,
    name: 'Nguyễn Chính Huy',
    time: '20-2-2025',
    phoneNumber: '08641****2',
    address: 'Quận 7',
    content: 'Dịch vụ giao hàng rất nhanh, nhân viên hỗ trợ tận tình và thân thiện. Rất hài lòng!',
    imageUrl: Man,
  },
  {
    id: 2,
    name: 'Phạm Huyền An',
    time: '4-1-2025',
    phoneNumber: '03862****4',
    address: 'Dĩ An',
    content: 'Hàng hóa được giao đầy đủ, đúng giá, đúng thời gian. Dịch vụ đáng tin cậy!',
    imageUrl: Girl,
  },
  {
    id: 3,
    name: 'Đỗ Huy Hoàng',
    time: '20-4-2025',
    phoneNumber: '03912****9',
    address: 'Tân Phú',
    content: 'Tôi nhận được ưu đãi hấp dẫn từ công ty. Rất chuyên nghiệp và chu đáo, chắc chắn sẽ ủng hộ lâu dài!',
    imageUrl: Man,
  },
];


export const TeamMembers = [
  {
    name: 'Thương',
    position: 'Giám đốc',
    imageUrl: Man,
    description: {
      // Phone: "0932070787",
      // Zalo: "0932070787",
      // onCompany: "12/12/2014",
    }
  },
  {
    name: 'Hằng',
    position: 'Kế toán',
    imageUrl: Girl,
    description: {
      Phone: "0932070787",
      Zalo: "0932070787",
      onCompany: "12/12/2014",
    }
  },
  {
    name: 'Tú',
    position: 'Trưởng Sales',
    imageUrl: Man,
    description: {
      Phone: "0932070787",
      Zalo: "0932070787",
      onCompany: "12/12/2014",
    }
  },
  {
    name: 'Huy',
    position: 'Trường phòng Sales',
    imageUrl: Man,
    description: {
      Phone: "0938009133",
      Zalo: "0938009133",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Đại',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0906792956",
      Zalo: "0906792956",
      onCompany: "01/04/2025",
    }
  },
  {
    name: 'Cường',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "123123123",
      Zalo: "123123123",
      onCompany: "12/12/2024",
    }
  },
  {
    name: 'Đức',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0903683655",
      Zalo: "0903683655",
      onCompany: "04/04/2025",
    }
  },
  {
    name: 'Hòa Lê',
    position: 'Sales',
    imageUrl: Girl,
    description: {
      Phone: "0869831704",
      Zalo: "0869831704",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Yến',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0938114328",
      Zalo: "0938114328",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Duy',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0973271438",
      Zalo: "0973271438",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Duy Thắng',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0973271438",
      Zalo: "0973271438",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Trang',
    position: 'Sales',
    imageUrl: Girl,
    description: {
      Phone: "0935110833",
      Zalo: "0935110833",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Thảo',
    position: 'Sales',
    imageUrl: Girl,
    description: {
      Phone: "0931776133",
      Zalo: "0931776133",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Sỹ',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0906921933",
      Zalo: "0906921933",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Minh',
    position: 'Sales',
    imageUrl: Man,
    description: {
      Phone: "0906731033",
      Zalo: "0906921933",
      onCompany: "04/04/2022",
    }
  },
  {
    name: 'Dũng',
    position: 'IT',
    imageUrl: Man,
    description: {
      Phone: "0932667533",
      Zalo: "0932667533",
      onCompany: "04/04/2025",
    }
  },
];
