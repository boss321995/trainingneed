export interface StrategicActionPlan {
  code: string
  name: string
  owner?: string
}

export interface StrategicTactic {
  code: string
  name: string
  description?: string
  actionPlans: StrategicActionPlan[]
}

export interface StrategicStrategy {
  code: string
  name: string
  description?: string
  tactics: StrategicTactic[]
}

export interface StrategicObjective {
  code: string
  name: string
  description?: string
  owner?: string
  strategies: StrategicStrategy[]
}

// NOTE:
// ข้อมูลนี้ถอดมาจากเอกสารแผนยุทธศาสตร์ (ภาพประกอบ) เพื่อให้เลือกหัวข้อตามลำดับ
// หากมีการอัปเดตแผน สามารถแก้ไขค่าที่นี่ให้ตรงกับข้อมูลล่าสุดได้ทันที
export const strategicPlanHierarchy: StrategicObjective[] = [
  {
    code: 'SO1',
    name: 'Diversify Revenue Streams',
    description: 'พัฒนานวัตกรรมดิจิทัลเพื่อขับเคลื่อนเศรษฐกิจและสังคมดิจิทัลของประเทศ',
    owner: 'รจญ.จ. รจญ.บ. รจญ.ป.',
    strategies: [
      {
        code: 'S1.1',
        name: 'พัฒนานวัตกรรมสำหรับเปลี่ยนกระบวนการทำงานของหน่วยงานภาครัฐให้เป็นดิจิทัล',
        tactics: [
          {
            code: 'T1.1.1',
            name: 'สร้างแพลตฟอร์มการจัดเก็บข้อมูลภาครัฐและกำกับธรรมาภิบาลของข้อมูลภาครัฐ',
            actionPlans: [
              { code: 'AP1.1', name: 'Cloud First and AI initiatives', owner: 'นอจ.' },
              { code: 'AP1.2', name: 'National Single Windows (NEXT NSW)', owner: 'นอจ.' }
            ]
          },
          {
            code: 'T1.1.2',
            name: 'สร้างแพลตฟอร์มและโซลูชันเพื่อเมืองอัจฉริยะ',
            actionPlans: [
              { code: 'AP1.3', name: 'Digipolis', owner: 'นอจ.' }
            ]
          }
        ]
      },
      {
        code: 'S1.2',
        name: 'พัฒนาบุคลากรผู้พัฒนาและให้บริการความมั่นคงปลอดภัยไซเบอร์ของประเทศ',
        tactics: [
          {
            code: 'T1.2.1',
            name: 'สร้างบุคลากรผู้ให้บริการด้าน Cyber Security และผู้ดูแลระบบโครงสร้างพื้นฐานสำคัญของประเทศ',
            actionPlans: [
              { code: 'AP1.4', name: 'Secure Space', owner: 'นอจ.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: 'SO2',
    name: 'Strengthen Core Business',
    description: 'พัฒนาโครงสร้างพื้นฐานโทรคมนาคมและดิจิทัล ยกระดับคุณภาพบริการเพื่อเพิ่มศักยภาพการแข่งขัน',
    owner: 'รจญ.ค. รจญ.ธ. รจญ.ม. รจญ.ข.',
    strategies: [
      {
        code: 'S2.1',
        name: 'พัฒนาบริการพื้นฐานโทรคมนาคมให้มีคุณภาพ มั่นคง ปลอดภัย และรองรับบริการดิจิทัล',
        tactics: [
          {
            code: 'T2.1.1',
            name: 'สร้างโครงข่ายพื้นฐานโทรคมนาคมแห่งชาติให้มีประสิทธิภาพและปลอดภัย',
            actionPlans: [
              { code: 'AP2.1', name: 'พัฒนาโครงข่ายศูนย์กลางดิจิทัล (Digital Hub)', owner: 'นภช.' },
              { code: 'AP2.2', name: 'แผนโครงข่ายพื้นฐานภาครัฐ National Backbone', owner: 'นภช.' },
              { code: 'AP2.3', name: 'ยกระดับบริการโครงข่ายและศูนย์ข้อมูลภาครัฐ', owner: 'นภช.' }
            ]
          },
          {
            code: 'T2.1.2',
            name: 'เชื่อมต่อโครงข่ายและบริการระหว่างประเทศเพื่อเพิ่มขีดความสามารถการแข่งขัน',
            actionPlans: [
              { code: 'AP2.4', name: 'ขยายความร่วมมือโครงข่าย Global Connectivity', owner: 'นภช.' },
              { code: 'AP2.5', name: 'ยกระดับบริการผสานเครือข่ายและแพลตฟอร์มดิจิทัล', owner: 'นอส.' }
            ]
          }
        ]
      },
      {
        code: 'S2.2',
        name: 'ยกระดับคุณภาพลูกค้าสำคัญด้านโทรคมนาคมและบริการดิจิทัล',
        tactics: [
          {
            code: 'T2.2.1',
            name: 'ยกระดับการตลาดและบริการสำหรับลูกค้าภาครัฐและลูกค้าระดับยุทธศาสตร์',
            actionPlans: [
              { code: 'AP2.6', name: 'โครงการพัฒนาประสบการณ์ลูกค้าแบบบูรณาการ (CX Transformation)', owner: 'นอช.' },
              { code: 'AP2.7', name: 'แผนพัฒนาการให้บริการรูปแบบ Affiliate และ Partner', owner: 'นอค.' }
            ]
          }
        ]
      },
      {
        code: 'S2.3',
        name: 'เพิ่มประสิทธิภาพการใช้งานทรัพย์สินและขยายธุรกิจต่อยอด',
        tactics: [
          {
            code: 'T2.3.1',
            name: 'พัฒนาและต่อยอดธุรกิจอสังหาริมทรัพย์ขององค์กร',
            actionPlans: [
              { code: 'AP2.8', name: 'บริหารจัดการพอร์ตอสังหาริมทรัพย์เพื่อสร้างรายได้', owner: 'ผอส.' },
              { code: 'AP2.9', name: 'แผนปรับปรุงสินทรัพย์สิ่งปลูกสร้างให้เกิดมูลค่าเพิ่ม', owner: 'ผอส.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: 'SO3',
    name: 'Partnership & Intrapreneur',
    description: 'สร้างพันธมิตรเชิงรุกพร้อมทั้งพัฒนานวัตกรรมต่อยอดและขยายขอบเขตธุรกิจใหม่',
    owner: 'รจญ.ย.',
    strategies: [
      {
        code: 'S3.1',
        name: 'ร่วมมือกับพันธมิตรเชิงรุกสร้างหน่วยงานภายในเพื่อพัฒนานวัตกรรมต่อยอดและขยายขอบเขตธุรกิจที่เกี่ยวเนื่อง',
        tactics: [
          {
            code: 'T3.1.1',
            name: 'สร้างโครงสร้างพื้นฐานความร่วมมือเชิงธุรกิจรูปแบบใหม่',
            actionPlans: [
              { code: 'AP3.1', name: 'Proactive Partnership Program', owner: 'พธ.' },
              { code: 'AP3.2', name: 'Venture Builder (นอส.)', owner: 'นอส.' }
            ]
          },
          {
            code: 'T3.1.2',
            name: 'สร้างและพัฒนานวัตกรรมต่อยอดธุรกิจ',
            actionPlans: [
              { code: 'AP3.3', name: 'แผนขยายธุรกิจดิจิทัลรูปแบบใหม่ (New Digital Biz)', owner: 'นอส.' }
            ]
          }
        ]
      }
    ]
  },
  {
    code: 'SO4',
    name: 'Build Leadership & Streamline Operation',
    description: 'มุ่งสู่การเป็นองค์กรสมรรถนะสูงที่ยั่งยืนด้วยเทคโนโลยีดิจิทัลและนวัตกรรมการพัฒนาทรัพยากรบุคคลอย่างมีประสิทธิภาพ',
    owner: 'รจญ.บ. รจญ.ย. ชจญ.ญ. กก.',
    strategies: [
      {
        code: 'S4.1',
        name: 'ปรับเปลี่ยนการบริหารองค์กรและการจัดการทรัพยากรบุคคลด้วยเครื่องมือดิจิทัลระดับสากล',
        tactics: [
          {
            code: 'T4.1.1',
            name: 'ยกระดับการบริหารทรัพยากรบุคคลด้วยระบบสากล',
            actionPlans: [
              { code: 'AP4.1', name: 'Digitalize Recruitment (กสพ.)', owner: 'กสพ.' },
              { code: 'AP4.2', name: 'Culture (One NT)', owner: 'กบ.' }
            ]
          }
        ]
      },
      {
        code: 'S4.2',
        name: 'เพิ่มประสิทธิภาพกระบวนการทำงานด้วยเทคโนโลยีดิจิทัล',
        tactics: [
          {
            code: 'T4.2.1',
            name: 'ขับเคลื่อนองค์การสู่การเป็นองค์กรดิจิทัล (Organizational Transformation)',
            actionPlans: [
              { code: 'AP4.3', name: 'Digitalization Infrastructure (กบ.)', owner: 'กบ.' },
              { code: 'AP4.4', name: 'Digital Decision (กบ.)', owner: 'กบ.' }
            ]
          },
          {
            code: 'T4.2.2',
            name: 'สร้างระบบงานอัตโนมัติและการจัดการข้อมูลด้วยเครื่องมือดิจิทัล',
            actionPlans: [
              { code: 'AP4.5', name: 'Intelligent Operations Platform', owner: 'กบ.' }
            ]
          },
          {
            code: 'T4.2.3',
            name: 'ยกระดับวัฒนธรรมการทำงานมุ่งสู่การใช้ทรัพยากรอย่างยั่งยืน',
            actionPlans: [
              { code: 'AP4.6', name: 'Go Green for NT Sustainability', owner: 'พชบ. นธญ.' }
            ]
          }
        ]
      }
    ]
  }
]
