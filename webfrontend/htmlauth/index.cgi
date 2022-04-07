#!/usr/bin/perl

require LoxBerry::Web;
use LoxBerry::JSON;
use CGI;

my $cgi = CGI->new;
my $q = $cgi->Vars;

if( $q->{ajax} ) {
  print $cgi->header(-type => 'application/json', -charset => 'utf-8', -status => '200 OK');	
  
  if( $q->{ajax} eq "restart" ) {
    `npm --prefix $lbpbindir run manager:restart`;
    `npm --prefix $lbpbindir run restart`;
    print "ok"
  }

  exit;
} else {

  my $template = HTML::Template->new(
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
}
	