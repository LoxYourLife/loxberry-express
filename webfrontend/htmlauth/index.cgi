#!/usr/bin/perl

require LoxBerry::Web;
use CGI;

my $template;
	
$template = HTML::Template->new(
  filename => "$lbptemplatedir/index.html",
  global_vars => 0,
  loop_context_vars => 0,
  die_on_bad_params => 0,
);
%L = LoxBerry::System::readlanguage($template, "language.ini");

my $plugintitle = "Express " . LoxBerry::System::pluginversion();
my $helplink = "";
my $helptemplate = "";
LoxBerry::Web::lbheader($plugintitle, $helplink, $helptemplate);

print $template->output();

LoxBerry::Web::lbfooter();
