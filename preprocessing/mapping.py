def get_mapping():
    mapping_list = [
        {
            "feature": "estruct",
            "description": "earning structure",
            "codes": [
                {
                    "code":"TOTAL",
                    "label":"Total"
                },
                {
                    "code":"GRS",
                    "label":"Gross earning"
                },
                {
                    "code":"TAX",
                    "label":"Taxes"
                },
                {
                    "code":"SOC",
                    "label":"Social Security"
                },
                {
                    "code":"FAM",
                    "label":"Family allowances"
                },
                {
                    "code":"NET",
                    "label":"Net earning"
                }
            ]
        },
        {
            "feature":"ecase",
            "description": "earning case",
            "codes": [
                {
                    "code":"TOTAL",
                    "label":"Total"
                },
                {
                    "code":"A1_33",
                    "label":"Single person without children, 33% of AW"
                },
                {
                    "code":"A1_50",
                    "label":"Single person without children, 50% of AW"
                },
                {
                    "code":"A1_67",
                    "label":"Single person without children, 67% of AW"
                },
                {
                    "code":"A1_80",
                    "label":"Single person without children, 80% of AW"
                },
                {
                    "code":"A1_100",
                    "label":"Single person without children, 100% of AW"
                },
                {
                    "code":"A1_125",
                    "label":"Single person without children, 125% of AW"
                },
                {
                    "code":"A1_167",
                    "label":"Single person without children, 167% of AW"
                },
                {
                    "code":"A1_2CH_67",
                    "label":"Single person with 2 children, 67% of AW"
                },
                {
                    "code":"CPL_2CH_33_0",
                    "label":"One-earner married couple, at 33% of AW, with two children"
                },
                {
                    "code":"CPL_2CH_100_0",
                    "label":"One-earner married couple, at 100% of AW, with two children"
                },
                {
                    "code":"CPL_2CH_100_33",
                    "label":"Two-earner married couple, one at 100%, the other at 33% of AW, with two children"
                },
                {
                    "code":"CPL_2CH_100_67",
                    "label":"Two-earner married couple, one at 100%, the other at 67% of AW, with two children"
                },
                {
                    "code":"CPL_2CH_100_100",
                    "label":"Two-earner married couple, one at 100%, the other at 100% of AW, with two children"
                },
                {
                    "code":"CPL_100_33",
                    "label":"Two-earner married couple, one at 100%, the other at 33% of AW, with no children"
                },
                {
                    "code":"CPL_100_100",
                    "label":"Two-earner married couple, one at 100%, the other at 100% of AW, with no children"
                },
            ]
        },
        {
            "feature": "currency",
            "description" : "currency used",
            "codes": [
                {
                    "code":"EUR",
                    "label":"Euro"
                },
                {
                    "code":"PPS",
                    "label":"Purchasing Power Standard"
                },
                {
                    "code":"NAC",
                    "label":"National currency"
                }
            ]
        },
        {
            "feature":"country",
            "description": "Geopolitical entity",
            "codes": [
                {
                    "code":"EU28",
                    "label":"European Union (28 countries)"
                },
                {
                    "code":"EU27",
                    "label":"European Union (27 countries)"
                },
                {
                    "code":"EU25",
                    "label":"European Union (25 countries)"
                },
                {
                    "code":"EU15",
                    "label":"European Union (15 countries)"
                },
                {
                    "code":"EA19",
                    "label":"Euro area (19 countries)"
                },
                {
                    "code":"EA18",
                    "label":"Euro area (18 countries)"
                },
                {
                    "code":"EA17",
                    "label":"Euro area (17 countries)"
                },
                {
                    "code":"BE",
                    "label":"Belgium"
                },
                {
                    "code":"BG",
                    "label":"Bulgaria"
                },
                {
                    "code":"CZ",
                    "label":"Czech Republic"
                },
                {
                    "code":"DK",
                    "label":"Denmark"
                },
                {
                    "code":"DE",
                    # (until 1990 former territory of the FRG)
                    "label":"Germany"
                },
                {
                    "code":"EE",
                    "label":"Estonia"
                },
                {
                    "code":"IE",
                    "label":"Ireland"
                },
                {
                    "code":"EL",
                    "label":"Greece"
                },
                {
                    "code":"ES",
                    "label":"Spain"
                },
                {
                    "code":"FR",
                    "label":"France"
                },
                {
                    "code":"HR",
                    "label":"Croatia"
                },
                {
                    "code":"IT",
                    "label":"Italy"
                },
                {
                    "code":"CY",
                    "label":"Cyprus"
                },
                {
                    "code":"LV",
                    "label":"Latvia"
                },
                {
                    "code":"LT",
                    "label":"Lithuania"
                },
                {
                    "code":"LU",
                    "label":"Luxembourg"
                },
                {
                    "code":"HU",
                    "label":"Hungary"
                },
                {
                    "code":"MT",
                    "label":"Malta"
                },
                {
                    "code":"NL",
                    "label":"Netherlands"
                },
                {
                    "code":"AT",
                    "label":"Austria"
                },
                {
                    "code":"PL",
                    "label":"Poland"
                },
                {
                    "code":"PT",
                    "label":"Portugal"
                },
                {
                    "code":"RO",
                    "label":"Romania"
                },
                {
                    "code":"SI",
                    "label":"Slovenia"
                },
                {
                    "code":"SK",
                    "label":"Slovakia"
                },
                {
                    "code":"FI",
                    "label":"Finland"
                },
                {
                    "code":"SE",
                    "label":"Sweden"
                },
                {
                    "code":"UK",
                    "label":"United Kingdom"
                },
                {
                    "code":"IS",
                    "label":"Iceland"
                },
                {
                    "code":"NO",
                    "label":"Norway"
                },
                {
                    "code":"CH",
                    "label":"Switzerland"
                },
                {
                    "code":"TR",
                    "label":"Turkey"
                },
                {
                    "code":"US",
                    "label":"United States"
                },
                {
                    "code":"JP",
                    "label":"Japan"
                }
            ]
        },
    ]
    return mapping_list