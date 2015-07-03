# set working directory to the current location of this file
require(ggplot2)
library(dplyr)
library(reshape2)

# load the data
data = read.csv('../preprocessing/data/tax_ratio.csv', header=FALSE)
names(data) <- c("year","ratio","country", "country.code")

# distribution of tax rates
ggplot(data, aes(x=factor(ratio))) +
  geom_bar(fill="lightblue") +
  theme_bw()

# helper function to produce the average line
stat_sum_single <- function(fun, geom="point", ...) {
  stat_summary(fun.y=fun, colour="red", geom=geom, size = 1.5, ...)
}

data.by_country.average <- data %>%
  group_by(country) %>%
  summarise(mean = mean(ratio, na.rm = TRUE)) %>%
  arrange(desc(mean))

summary(data.by_country.average$mean)

# On average, tax rates are constant in the Eurozone since 2000, however, the financial crisis has some serious impact on countries.
ggplot(data, aes(x = year, y = ratio * 100)) +
  geom_point(aes(colour = factor(country))) +
  geom_line(aes(colour = country)) +
  stat_sum_single(mean, geom="line") +
  theme_bw()

# split the data using the 1q and 3q
data.by_country.average$category <- cut(data.by_country.average$mean,
  breaks=c(-Inf, 
           quantile(data.by_country.average$mean, 0.25), 
           quantile(data.by_country.average$mean, 0.75), 
           Inf),
  labels=c("low","medium","high"))

# Income tax rates vary hugely between countries and depend highly on other factors like earnings, martial status and so on.  Where in Europe do people pay the highest slice of their earnings to the tax man ?  According to the Eurostat organization, a single person on an average salary without children will have the highest income tax rate in Belgium - some 42.1% of his or her earnings.  Germany isn't too far behind at 41.3%.  Neighbording Danemark comes in third with 40.6 %

# observation : the country with the highest tax rate are located in the North-West part of the eurozone.
ggplot(data.by_country.average, aes(x=reorder(country, -mean), y = mean*100)) +
  geom_bar(stat="identity", aes(fill = category)) +
  theme_bw() +
  theme(
    panel.grid.major.y = element_line(colour = "black", linetype = 3, size = .5),
    panel.background = element_blank(),
    axis.title.x = element_text(size=16),
    axis.text.x = element_text(size=14, angle=45, hjust=1, vjust=1),
    axis.title.y = element_text(size=16, angle = 90),
    axis.text.y = element_text(size=14),
    strip.background = element_rect(color="white", fill="white"),
    strip.text = element_text(size=16),
    legend.position="right",
    legend.direction = "vertical"
  )

# on average, country where the tax rate is low are increasing their rate since 2000.
# Noticed how most of these country has increased the taxes around late 2009 where the the European debt crisis erupted ...
ggplot(subset(data, country.code %in% c('CZ', 'PT', 'BG', 'SK', 'ES', 'EE', 'EL', 'IE', 'MT')), aes(x = year, y = ratio * 100)) +
  geom_point(aes(colour = factor(country))) +
  geom_line(aes(colour = factor(country))) +
  stat_sum_single(mean, geom="line") +
  theme_bw()

# country with the lowest tax rate are those who were unable to repay or redinance their government debt or to bail out over-indebted banks under their national supervision without the assistance of third parties like the ECB (European Central Bank) ....

# The eurozone crisis resulted from a combination of complex factors, including the globalisation of finance; easy credit conditions during the 2002–2008 period that encouraged high-risk lending and borrowing practices;  We can argue that some countries where more or less impacted by the crisis ...

# During the course of 2010-12 it became evident that, out of the eighteen eurozone states, Greece, Ireland, Portugal, Spain facing persistent negative growth prospects and increasing government debt, would find it dificult or impossible to repay or refinance their government debt without the assistance of bailout support from the Troika.

# The transfers of bailout funds were performed in tranches over several years and were conditional on the governments simultaneously implementing a package of fiscal consolidation, structural reforms, privatization of public assets and setting up funds for further bank recapitalization and resolution.

# Except for Ireland, the countries helped with the bailout programme are located in the sought of the Eurozone.
ggplot(subset(data, country.code %in% c('IE', 'ES', 'PT', 'EL')), aes(x = year, y = ratio * 100)) +
  geom_point(aes(colour = factor(country))) +
  geom_line(aes(colour = country)) +
  stat_sum_single(mean, geom="line") +
  theme_bw()

# on average, country where the tax rate is high are keeping the rate constant since 2000
# Three countries are leading the top of the highest tax rate, Belgium, Germany and Danmark.
# These counries are those where the impact of the crisis was the least significant
ggplot(subset(data, country.code %in% c('BE', 'DE', 'DK', 'HU', 'AT', 'SI', 'NL')), aes(x = year, y = ratio * 100)) +
  geom_point(aes(colour = factor(country))) +
  geom_line(aes(colour = country)) +
  stat_sum_single(mean, geom="line") +
  theme_bw()

# In the middle of the class, three countries have substentially decreaded their tax rates  PL, UK, LT
# On the other hand, Italy has increased the taxes significantly since the financial crisis.
ggplot(subset(data, country.code %in% c('FI', 'IT', 'LV', 'NO', 'TK', 'FR', 'IS', 'RO', 'SW', 'LU', 'PL', 'UK', 'LT')), aes(x = year, y = ratio * 100)) +
  geom_point(aes(colour = factor(country))) +
  geom_line(aes(colour = country)) +
  stat_sum_single(mean, geom="line") +
  theme_bw()
