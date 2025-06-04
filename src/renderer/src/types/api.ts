// 基础API响应类型
export interface ApiResponse<T = any> {
  status: {
    code: number;
  };
  data?: T;
  message?: string;
}

// 搜索筛选条件 - 根据Wiza API规范
export interface SearchFilters {
  first_name?: string[];                    // 名字 - 精确匹配
  last_name?: string[];                     // 姓氏 - 精确匹配
  job_title?: JobTitleFilter[];             // 职位 - 支持包含/排除
  job_title_level?: JobTitleLevel[];        // 职位级别
  job_role?: JobRole[];                     // 职位角色
  job_sub_role?: JobSubRole[];              // 职位子角色
  location?: Location[];                    // 个人地点
  skill?: string[];                         // 技能
  school?: string[];                        // 学校 - 精确匹配
  major?: string[];                         // 学术专业 (注意：这是学术专业，不是行业)
  linkedin_slug?: string[];                 // LinkedIn链接
  job_company?: CompanyFilter[];            // 当前公司
  past_company?: CompanyFilter[];           // 过往公司
  company_location?: Location[];            // 公司地点
  company_industry?: CompanyIndustry[];     // 公司行业 (这是正确的行业字段)
  company_size?: CompanySize[];             // 公司规模
  company_annual_growth?: CompanyGrowth;    // 公司年增长率
  department_size?: string[];               // 部门规模
  revenue?: Revenue[];                      // 公司收入
  funding_date?: FundingDate;               // 融资日期
  last_funding_min?: FundingAmount;         // 最后融资最小金额
  last_funding_max?: FundingAmount;         // 最后融资最大金额
  funding_min?: FundingAmount;              // 总融资最小金额
  funding_max?: FundingAmount;              // 总融资最大金额
  funding_stage?: FundingStage;             // 融资阶段
  funding_type?: FundingType;               // 融资类型
  company_type?: CompanyType[];             // 公司类型
  company_summary?: CompanyFilter[];        // 公司描述
  year_founded_start?: string;              // 公司成立年份开始
  year_founded_end?: string;                // 公司成立年份结束
  lastNames?: string[];
  locations?: string[];
  industries?: string[];
  keywords?: string[];
  positions?: string[];
  companies?: string[];
  excludeTerms?: string[];
}

// 职位筛选
export interface JobTitleFilter {
  v: string;    // 职位名称
  s: 'i' | 'e'; // 包含或排除
}

// 公司筛选
export interface CompanyFilter {
  v: string;    // 公司名称或描述
  s: 'i' | 'e'; // 包含或排除
}

// 地点信息
export interface Location {
  v: string;    // 地点名称
  b: 'city' | 'state' | 'country';  // 地点类型
  s?: 'i' | 'e';  // 包含或排除 (include/exclude)
}

// 搜索响应
export interface SearchResponse {
  status: {
    code: number;
  };
  data: {
    total: number;
  };
}

// 列表配置 - 根据Wiza API规范
export interface ListConfig {
  name: string;
  max_profiles: number;
  enrichment_level?: 'none' | 'partial' | 'full';
  email_options?: {
    accept_work: boolean;
    accept_personal: boolean;
    accept_generic: boolean;
  };
  skip_duplicates?: boolean;
  callback_url?: string;
}

// 创建列表数据 - 根据Wiza API规范
export interface CreateListData {
  filters: SearchFilters;
  list: ListConfig;
}

// 列表响应 - 根据OpenAPI规范
export interface ListResponse {
  status: {
    code: number;
    message: string;
  };
  type: 'list';
  data: {
    id: number;  // 根据规范应该是integer类型
    name: string;
    status: string;
    stats: {
      people: number;
      credits?: {
        email_credits?: number;
        phone_credits?: number;
        export_credits?: number;
        api_credits?: {
          email_credits: number;
          phone_credits: number;
          scrape_credits: number;
          total: number;
        };
      };
    };
    finished_at?: string;
    created_at: string;
    enrichment_level: string;
    email_options: {
      accept_work: boolean;
      accept_personal: boolean;
      accept_generic: boolean;
    };
    report_type: string;
  };
}

// 列表状态响应 - 根据OpenAPI规范
export interface ListStatusResponse {
  status: {
    code: number;
    message: string;
  };
  type: 'list';
  data: {
    id: number;  // 根据规范应该是integer类型
    name: string;
    status: 'queued' | 'processing' | 'scraping' | 'finished' | 'failed';  // 根据规范更新状态值，包含scraping
    stats: {
      people: number;
      credits?: {
        email_credits?: number;
        phone_credits?: number;
        export_credits?: number;
        api_credits?: {
          email_credits: number;
          phone_credits: number;
          scrape_credits: number;
          total: number;
        };
      };
    };
    finished_at?: string;
    created_at: string;
    enrichment_level: string;
    email_options: {
      accept_work: boolean;
      accept_personal: boolean;
      accept_generic: boolean;
    };
    report_type: string;
  };
}

// 继续搜索响应 - 根据OpenAPI规范
export interface ContinueSearchResponse {
  status: {
    code: number;
    message: string;
  };
  type: 'list';
  data: {
    id: number;  // 根据规范应该是integer类型
    name: string;
    status: string;
    stats: {
      people: number;
      credits?: {
        email_credits?: number;
        phone_credits?: number;
        export_credits?: number;
        api_credits?: {
          email_credits: number;
          phone_credits: number;
          scrape_credits: number;
          total: number;
        };
      };
    };
    finished_at?: string;
    created_at: string;
    enrichment_level: string;
    email_options: {
      accept_work: boolean;
      accept_personal: boolean;
      accept_generic: boolean;
    };
    report_type: string;
  };
}

// 联系人信息 - 根据OpenAPI规范
export interface Contact {
  list_name: string;
  email_type?: string | null;
  email_status?: string | null;
  email?: string | null;
  full_name?: string | null;
  first_name: string;
  last_name: string;
  title: string;
  location: string;
  linkedin: string;
  domain: string;
  company: string;
  company_domain: string;
  company_industry?: string | null;
  company_subindustry?: string | null;
  company_size?: string | null;
  company_size_range?: string | null;
  company_founded?: string | null;
  company_revenue?: string | null;
  company_funding?: string | null;
  company_type?: string | null;
  company_linkedin: string;
  company_twitter?: string | null;
  company_facebook?: string | null;
  company_description?: string | null;
  company_last_funding_round?: string | null;
  company_last_funding_amount?: string | null;
  company_last_funding_at?: string | null;
  company_location?: string | null;
  company_street?: string | null;
  company_locality?: string | null;
  company_region?: string | null;
  company_country?: string | null;
  id: string;
  position?: string;
  phone?: string;
  profilePictureUrl?: string;
  connections?: number;
  notes?: string;
}

// 联系人响应
export interface ContactsResponse {
  status: {
    code: number;
  };
  data: Contact[];
}

// 积分响应
export interface CreditsResponse {
  credits: {
    email_credits: number | 'unlimited';
    phone_credits: number | 'unlimited';
    export_credits: number;
    api_credits: number;
  };
}

// 个人揭示响应 - 根据OpenAPI规范
export interface IndividualRevealResponse {
  status: {
    code: number;
    message: string;
  };
  type: 'individual_reveal';
  data: {
    id: number;  // 根据规范应该是integer类型
    status: string;
    is_complete: boolean;
  };
}

// 错误响应
export interface ErrorResponse {
  status: number;
  message: string;
}

// 职位级别枚举
export type JobTitleLevel = 
  | 'CXO' 
  | 'Director' 
  | 'Entry' 
  | 'Manager' 
  | 'Owner' 
  | 'Partner' 
  | 'Senior' 
  | 'Training' 
  | 'Unpaid' 
  | 'VP';

// 职位角色枚举
export type JobRole = 
  | 'customer_service'
  | 'design'
  | 'education'
  | 'engineering'
  | 'finance'
  | 'health'
  | 'human_resources'
  | 'legal'
  | 'marketing'
  | 'media'
  | 'operations'
  | 'public_relations'
  | 'real_estate'
  | 'sales'
  | 'trades';

// 职位子角色枚举
export type JobSubRole = 
  | 'accounting'
  | 'accounts'
  | 'brand_marketing'
  | 'broadcasting'
  | 'business_development'
  | 'compensation'
  | 'content_marketing'
  | 'customer_success'
  | 'data'
  | 'dental'
  | 'devops'
  | 'doctor'
  | 'editorial'
  | 'education_administration'
  | 'electrical'
  | 'employee_development'
  | 'events'
  | 'fitness'
  | 'graphic_design'
  | 'information_technology'
  | 'instructor'
  | 'investment'
  | 'journalism'
  | 'judicial'
  | 'lawyer'
  | 'logistics'
  | 'marketing_communications'
  | 'mechanical'
  | 'media_relations'
  | 'network'
  | 'nursing'
  | 'office_management'
  | 'paralegal'
  | 'pipeline'
  | 'product'
  | 'product_design'
  | 'product_marketing'
  | 'professor'
  | 'project_engineering'
  | 'project_management'
  | 'property_management'
  | 'quality_assurance'
  | 'realtor'
  | 'recruiting'
  | 'researcher'
  | 'security'
  | 'software'
  | 'support'
  | 'systems'
  | 'tax'
  | 'teacher'
  | 'therapy'
  | 'video'
  | 'web'
  | 'web_design'
  | 'wellness'
  | 'writing';

// 公司行业枚举
export type CompanyIndustry = 
  | 'accounting'
  | 'airlines/aviation'
  | 'alternative dispute resolution'
  | 'alternative medicine'
  | 'animation'
  | 'apparel & fashion'
  | 'architecture & planning'
  | 'arts and crafts'
  | 'automotive'
  | 'aviation & aerospace'
  | 'banking'
  | 'biotechnology'
  | 'broadcast media'
  | 'building materials'
  | 'business supplies and equipment'
  | 'capital markets'
  | 'chemicals'
  | 'civic & social organization'
  | 'civil engineering'
  | 'commercial real estate'
  | 'computer & network security'
  | 'computer games'
  | 'computer hardware'
  | 'computer networking'
  | 'computer software'
  | 'construction'
  | 'consumer electronics'
  | 'consumer goods'
  | 'consumer services'
  | 'cosmetics'
  | 'dairy'
  | 'defense & space'
  | 'design'
  | 'e-learning'
  | 'education management'
  | 'electrical/electronic manufacturing'
  | 'entertainment'
  | 'environmental services'
  | 'events services'
  | 'executive office'
  | 'facilities services'
  | 'farming'
  | 'financial services'
  | 'fine art'
  | 'fishery'
  | 'food & beverages'
  | 'food production'
  | 'fund-raising'
  | 'furniture'
  | 'gambling & casinos'
  | 'government administration'
  | 'government relations'
  | 'graphic design'
  | 'health, wellness and fitness'
  | 'higher education'
  | 'hospital & health care'
  | 'hospitality'
  | 'human resources'
  | 'import and export'
  | 'individual & family services'
  | 'industrial automation'
  | 'information services'
  | 'information technology and services'
  | 'insurance'
  | 'international affairs'
  | 'international trade and development'
  | 'internet'
  | 'investment banking'
  | 'investment management'
  | 'judiciary'
  | 'law enforcement'
  | 'law practice'
  | 'legal services'
  | 'legislative office'
  | 'libraries'
  | 'logistics and supply chain'
  | 'luxury goods & jewelry'
  | 'machinery'
  | 'management consulting'
  | 'maritime'
  | 'market research'
  | 'marketing and advertising'
  | 'mechanical or industrial engineering'
  | 'media production'
  | 'medical devices'
  | 'medical practice'
  | 'mental health care'
  | 'military'
  | 'mining & metals'
  | 'motion pictures and film'
  | 'museums and institutions'
  | 'music'
  | 'nanotechnology'
  | 'newspapers'
  | 'non-profit organization management'
  | 'oil & energy'
  | 'online media'
  | 'outsourcing/offshoring'
  | 'package/freight delivery'
  | 'packaging and containers'
  | 'paper & forest products'
  | 'performing arts'
  | 'pharmaceuticals'
  | 'philanthropy'
  | 'photography'
  | 'plastics'
  | 'political organization'
  | 'primary/secondary education'
  | 'printing'
  | 'professional training & coaching'
  | 'program development'
  | 'public policy'
  | 'public relations and communications'
  | 'public safety'
  | 'publishing'
  | 'railroad manufacture'
  | 'ranching'
  | 'real estate'
  | 'recreational facilities and services'
  | 'religious institutions'
  | 'renewables & environment'
  | 'research'
  | 'restaurants'
  | 'retail'
  | 'security and investigations'
  | 'semiconductors'
  | 'shipbuilding'
  | 'sporting goods'
  | 'sports'
  | 'staffing and recruiting'
  | 'supermarkets'
  | 'telecommunications'
  | 'textiles'
  | 'think tanks'
  | 'tobacco'
  | 'translation and localization'
  | 'transportation/trucking/railroad'
  | 'utilities'
  | 'venture capital & private equity'
  | 'veterinary'
  | 'warehousing'
  | 'wholesale'
  | 'wine and spirits'
  | 'wireless'
  | 'writing and editing';

// 公司规模枚举
export type CompanySize = 
  | '1-10'
  | '11-50'
  | '51-200'
  | '201-500'
  | '501-1000'
  | '1001-5000'
  | '5001-10000'
  | '10001+';

// 公司年增长率枚举
export type CompanyGrowth = 
  | '0-5%'
  | '5-10%'
  | '10-20%'
  | '20-50%'
  | '50-100%'
  | '100%+';

// 收入枚举
export type Revenue = 
  | '$0-$1M'
  | '$1M-$10M'
  | '$10M-$25M'
  | '$25M-$50M'
  | '$50M-$100M'
  | '$100M-$250M'
  | '$250M-$500M'
  | '$500M-$1B'
  | '$1B-$10B'
  | '$10B+';

// 融资金额枚举
export type FundingAmount = 
  | '$500K'
  | '$1M'
  | '$5M'
  | '$10M'
  | '$25M'
  | '$50M'
  | '$100M'
  | '$250M'
  | '$500M'
  | '$1B';

// 融资日期
export interface FundingDate {
  t: 'last' | 'any';  // 最后一轮或任意轮
  v: '60d' | '90d' | '180d' | '270d' | '1y';  // 时间范围
}

// 融资阶段
export interface FundingStage {
  t: 'last' | 'any';  // 最后一轮或任意轮
  v: ('pre_seed' | 'seed' | 'series_a' | 'series_b' | 'series_c' | 'series_d' | 'series_e-j' | 'other')[];
}

// 融资类型
export interface FundingType {
  t: 'last' | 'any';  // 最后一轮或任意轮
  v: ('angel' | 'venture' | 'grant' | 'debt_financing' | 'private_equity' | 'crowdfunding' | 'other')[];
}

// 公司类型枚举
export type CompanyType = 
  | 'private'
  | 'public'
  | 'educational'
  | 'government'
  | 'nonprofit'
  | 'public_subsidiary';

// 列表详情接口
export interface ListDetails {
  id: string;
  name: string;
  createdAt: string;
  status: 'completed' | 'in_progress' | 'failed';
  totalProspects: number;
  completedProspects: number;
  progress: number;
  location?: string;
  industry?: string;
  lastNames?: string[];
}

// 导出设置接口
export interface ExportSettings {
  format: 'excel' | 'csv';
  fileName: string;
  selectedFields: string[];
  includeHeaders: boolean;
} 