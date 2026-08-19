-- Pantry location backfill
-- Run this against dbFindApantry after taking a database backup.
-- This changes only country values that are currently NULL or empty.

ALTER TABLE pantries
  ADD COLUMN country VARCHAR(100) NULL;

UPDATE pantries
SET country = 'USA'
WHERE (country IS NULL OR country = '')
  AND (
    UPPER(TRIM(state)) IN (
      'AL','ALABAMA','AK','ALASKA','AZ','ARIZONA','AR','ARKANSAS','CA','CALIFORNIA',
      'CO','COLORADO','CT','CONNECTICUT','DE','DELAWARE','FL','FLORIDA','GA','GEORGIA',
      'HI','HAWAII','ID','IDAHO','IL','ILLINOIS','IN','INDIANA','IA','IOWA','KS','KANSAS',
      'KY','KENTUCKY','LA','LOUISIANA','ME','MAINE','MD','MARYLAND','MA','MASSACHUSETTS',
      'MI','MICHIGAN','MN','MINNESOTA','MS','MISSISSIPPI','MO','MISSOURI','MT','MONTANA',
      'NE','NEBRASKA','NV','NEVADA','NH','NEW HAMPSHIRE','NJ','NEW JERSEY','NM','NEW MEXICO',
      'NY','NEW YORK','NC','NORTH CAROLINA','ND','NORTH DAKOTA','OH','OHIO','OK','OKLAHOMA',
      'OR','OREGON','PA','PENNSYLVANIA','RI','RHODE ISLAND','SC','SOUTH CAROLINA',
      'SD','SOUTH DAKOTA','TN','TENNESSEE','TX','TEXAS','UT','UTAH','VT','VERMONT',
      'VA','VIRGINIA','WA','WASHINGTON','WV','WEST VIRGINIA','WI','WISCONSIN','WY','WYOMING',
      'DC','DISTRICT OF COLUMBIA'
    )
    OR address REGEXP '[[:space:]](USA|US|United States)[[:space:]]*$'
  );

UPDATE pantries
SET country = 'Canada'
WHERE (country IS NULL OR country = '')
  AND (
    UPPER(TRIM(state)) IN (
      'AB','ALBERTA','BC','BRITISH COLUMBIA','MB','MANITOBA','NB','NEW BRUNSWICK',
      'NL','NEWFOUNDLAND AND LABRADOR','NS','NOVA SCOTIA','NT','NORTHWEST TERRITORIES',
      'NU','NUNAVUT','ON','ONTARIO','PE','PRINCE EDWARD ISLAND','QC','QUEBEC',
      'SK','SASKATCHEWAN','YT','YUKON'
    )
    OR zip_code REGEXP '^[A-Za-z][0-9][A-Za-z][ -]?[0-9][A-Za-z][0-9]$'
    OR address REGEXP '[[:space:]](Canada)[[:space:]]*$'
  );

UPDATE pantries
SET country = 'Mexico'
WHERE (country IS NULL OR country = '')
  AND UPPER(TRIM(state)) IN (
    'AGUASCALIENTES','BAJA CALIFORNIA','BAJA CALIFORNIA SUR','CAMPECHE','CHIAPAS',
    'CHIHUAHUA','COAHUILA','COLIMA','DURANGO','GUANAJUATO','GUERRERO','HIDALGO',
    'JALISCO','MEXICO CITY','CIUDAD DE MEXICO','MEXICO STATE','ESTADO DE MEXICO',
    'MICHOACAN','MICHOACÁN','MORELOS','NAYARIT','NUEVO LEON','NUEVO LEÓN','OAXACA',
    'PUEBLA','QUERETARO','QUERÉTARO','QUINTANA ROO','SAN LUIS POTOSI','SAN LUIS POTOSÍ',
    'SINALOA','SONORA','TABASCO','TAMAULIPAS','TLAXCALA','VERACRUZ','YUCATAN','YUCATÁN','ZACATECAS'
  );

-- Review rows that could not be classified before the application uses the filter.
SELECT id, name, address, city, state, zip_code, latitude, longitude
FROM pantries
WHERE country IS NULL OR country = '';
