USE stockvault;

-- ==========================================================
-- STOCK SEED DATA - 35 Companies (Global + Indian Markets)
-- ==========================================================
INSERT INTO stocks (company_name, symbol, current_price, previous_price, available_quantity, sector, description) VALUES

-- US Technology
('Apple Inc.',               'AAPL',   189.30,  185.50,  5000, 'Technology',      'Consumer electronics, software and online services giant.'),
('Microsoft Corporation',    'MSFT',   415.20,  408.90,  4500, 'Technology',      'Enterprise software, cloud computing and gaming leader.'),
('NVIDIA Corporation',       'NVDA',   875.40,  842.10,  3000, 'Technology',      'Leading designer of graphics processing units and AI chips.'),
('Alphabet Inc.',            'GOOGL',  175.60,  172.30,  4000, 'Technology',      'Parent company of Google, YouTube and DeepMind.'),
('Meta Platforms Inc.',      'META',   505.80,  492.70,  3500, 'Technology',      'Social media conglomerate owning Facebook, Instagram and WhatsApp.'),
('Amazon.com Inc.',          'AMZN',   185.90,  180.40,  4200, 'E-Commerce',      'Global e-commerce, cloud computing and digital streaming leader.'),
('Tesla Inc.',               'TSLA',   245.70,  252.80,  6000, 'Automotive',      'Electric vehicle and clean energy company headquartered in Austin.'),
('Netflix Inc.',             'NFLX',   628.50,  615.20,  2500, 'Entertainment',   'Global streaming entertainment service with 260M+ subscribers.'),
('Salesforce Inc.',          'CRM',    298.40,  291.60,  2800, 'Technology',      'Cloud-based CRM and enterprise application platform.'),
('Adobe Inc.',               'ADBE',   545.30,  538.90,  2200, 'Technology',      'Multimedia and creativity software products and marketing analytics.'),

-- US Finance & Healthcare
('JPMorgan Chase & Co.',     'JPM',    198.70,  195.30,  5500, 'Finance',         'Largest US bank by assets, offering investment and retail banking.'),
('Visa Inc.',                'V',      276.40,  271.80,  4800, 'Finance',         'Global payments technology network connecting consumers and merchants.'),
('Johnson & Johnson',        'JNJ',    157.20,  159.40,  5200, 'Healthcare',      'Pharmaceutical, medical device and consumer healthcare products.'),
('Pfizer Inc.',              'PFE',    28.60,   29.80,   8000, 'Healthcare',      'Global biopharmaceutical company developing medicines and vaccines.'),
('UnitedHealth Group',       'UNH',    521.80,  512.40,  1800, 'Healthcare',      'Diversified health care company and health benefits insurer.'),

-- US Energy & Industrials
('ExxonMobil Corporation',   'XOM',    112.40,  110.90,  6500, 'Energy',          'Multinational oil and gas corporation and the largest US energy firm.'),
('Chevron Corporation',      'CVX',    153.80,  151.20,  4400, 'Energy',          'Integrated energy company engaged in oil and natural gas exploration.'),
('Boeing Company',           'BA',     185.60,  191.30,  3200, 'Industrials',     'Aerospace and defense manufacturer of commercial jetliners.'),
('Caterpillar Inc.',         'CAT',    347.90,  339.50,  2600, 'Industrials',     'World\'s leading manufacturer of construction and mining equipment.'),
('Walmart Inc.',             'WMT',    68.40,   67.10,   7000, 'Retail',          'Multinational retail corporation operating a chain of supercenters.'),

-- Indian Market Stocks
('Reliance Industries Ltd',  'RELIANCE', 2945.60, 2890.30, 3800, 'Conglomerate',  'India\'s largest private sector company with energy, retail and telecom.'),
('Tata Consultancy Services','TCS',    3842.70, 3790.50, 2900, 'Technology',      'Indian multinational IT services and consulting company.'),
('Infosys Ltd',              'INFY',   1567.40, 1543.20, 4100, 'Technology',      'Global IT services and consulting powerhouse headquartered in Bengaluru.'),
('HDFC Bank Ltd',            'HDFCBANK',1678.90,1652.40, 5100, 'Finance',         'India\'s largest private sector bank by assets and market cap.'),
('ICICI Bank Ltd',           'ICICIBANK',1089.50,1071.80,4700, 'Finance',         'Indian multinational banking and financial services company.'),
('Wipro Ltd',                'WIPRO',  468.20,  462.70,  5600, 'Technology',      'Leading global information technology and consulting company.'),
('HCL Technologies Ltd',     'HCLTECH',1398.60,1376.40, 3300, 'Technology',      'Global technology company specializing in digital transformation.'),
('Bharti Airtel Ltd',        'AIRTEL', 1245.30, 1228.90, 4200, 'Telecom',         'India\'s largest telecom company serving over 500 million customers.'),
('Asian Paints Ltd',         'ASIANPAINT',2876.40,2834.20,2400,'Consumer Goods',  'India\'s largest paint company and Asia\'s third largest coatings firm.'),
('Maruti Suzuki India Ltd',  'MARUTI', 11245.70,11089.30,1200,'Automotive',       'India\'s largest passenger car manufacturer with 40%+ market share.'),

-- Global Others
('Samsung Electronics',      'SMSN',   1456.30, 1432.80, 3600, 'Technology',      'South Korean multinational manufacturing semiconductors and electronics.'),
('Taiwan Semiconductor',     'TSM',    143.80,  138.90,  5800, 'Technology',      'World\'s largest dedicated semiconductor foundry based in Taiwan.'),
('Alibaba Group',            'BABA',   74.50,   72.30,   7200, 'E-Commerce',      'Chinese multinational technology company in e-commerce and cloud.'),
('Berkshire Hathaway',       'BRK.B',  365.40,  361.90,  2100, 'Conglomerate',    'Warren Buffett\'s holding company with diversified business portfolio.'),
('PayPal Holdings Inc.',     'PYPL',   62.40,   64.10,   6800, 'Finance',         'Online payments platform and digital commerce solutions provider.');
